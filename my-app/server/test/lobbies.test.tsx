/* 
------------------------------------------------------
Server Tests for Creating and Joining Lobbies
Routes: /lobbies, /create, /join
------------------------------------------------------
*/

import axios from 'axios';
import app from '../server';
import { connectDB } from '../db';
import { initDatabase } from '../db_table';
import { Database } from 'sqlite';
import { Server } from 'http';

let server: Server;
let db: Database;
const fs = require('fs');
const PORT = process.env.PORT || 8080;
const originalConsoleLog = console.log;

beforeAll(async () => {
    // Suppress message that appears every time database is initialized
    console.log = (...args) => {
      if (!args.includes('Database initialized with lobbies and player_items tables.')) {
          originalConsoleLog.apply(console, args);
      }
    };

    db = await connectDB();
    server = await app.listen(PORT); // Start the server before tests
});

afterAll(async () => {
    console.log = originalConsoleLog;
    fs.unlinkSync('database.sqlite'); // Automatically delete database.sqlite after all tests are done
    server.close(); // Stop the server after tests
});

beforeEach(async () => {
  await initDatabase();
});

afterEach(async () => {
  await db.run(`DROP TABLE IF EXISTS lobbies`);
  await db.run(`DROP TABLE IF EXISTS player_items`);
});

describe('/lobbies tests', () => {
  test('GET /lobbies should show all lobbies', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1"]', '[]', '[{"id":"Host 1","points":0}]', '1234', 21, 'waiting'),
      ('New Lobby 2', 'Host 2', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]', 
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '5678', 22, 'in-progress')
    `);

    // Perform the GET request to the /lobbies endpoint
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies`);
    expect(res.status).toBe(200);
    expect(res.data).toHaveLength(2);
    expect(res.data[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '["Host 1"]',
      scavengerItems: '[]',
      points: '[{"id":"Host 1","points":0}]',
      pin: '1234',
      gameTime: 21,
      status: 'waiting',
    });
    expect(res.data[1]).toMatchObject({
      lobbyName: 'New Lobby 2',
      host: 'Host 2',
      players: '["Host 1","Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      points: '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]',
      pin: '5678',
      gameTime: 22,
      status: 'in-progress',
    });
  });

  test('GET /lobbies with no lobbies table should return error', async () => {
    await db.run(`DROP TABLE lobbies`);

    try {
      await axios.get(`http://localhost:${PORT}/api/lobbies`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to retrieve lobbies',
        });
      } else {
        throw error;
      }
    }
  });
});

describe('/create tests', () => {
  test('POST /create should add a new lobby to lobbies', async () => {
    // Perform the POST request to the /create endpoint
    const res = await axios.post(`http://localhost:${PORT}/api/create`, {
      lobbyName: 'New Lobby 1',
      scavengerItems: [{id: 1, name: "Triton Statue", points: 10, found: false}, {id: 2, name: "Sun God", points: 10, found: false}],
      userId: 'Host 1',
      pin: '1234',
      gameTime: 50
    });

    expect(res.status).toBe(201);
    expect(res.data.message).toBe("Lobby 'New Lobby 1' created by Host 1");

    // Ensure the lobbies table is updated
    const lobbies = await db.all(`SELECT * FROM lobbies`);
    expect(lobbies).toHaveLength(1);
    expect(lobbies[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '["Host 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      points: '[{"id":"Host 1","points":0}]',
      pin: '1234',
      gameTime: 50,
      status: 'waiting'
    });

    // Ensure the player_items table is updated
    const player_items = await db.all(`SELECT * FROM player_items`);
    expect(player_items).toHaveLength(2);
    expect(player_items[0]).toMatchObject({ 
      player_id: 'Host 1', 
      lobby_id: 1, 
      item_id: 1, 
      found: 0, 
      image: '' 
    });
    expect(player_items[1]).toMatchObject({ 
      player_id: 'Host 1', 
      lobby_id: 1, 
      item_id: 2, 
      found: 0, 
      image: '' 
    });
  });

  test('POST /create with missing fields should return error', async () => {
    try {
      await axios.post(`http://localhost:${PORT}/api/create`, {
        lobbyName: 'New Lobby 1',
        scavengerItems: [{ id: 1, name: "Triton Statue", points: 10 }],
        pin: '1234',
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data).toMatchObject({
          error: 'Host userId is required',
        });
      } else {
        throw error;
      }
    }
  });

  test('POST /create with invalid scavengerItems should return error', async () => {
    try {
      await axios.post(`http://localhost:${PORT}/api/create`, {
        lobbyName: 'New Lobby',
        scavengerItems: "invalid data",
        userId: 'Host 1',
        pin: '1234',
        gameTime: 50
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to create lobby',
        });
      } else {
        throw error;
      }
    }
  });    
});

describe('/join tests', () => {
  test('POST /join should add a player to the given lobby', async () => {
    // Create a lobby for the player to join
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]', 
      '[{"id":"Host 1","points":0}]', '1234', 60, 'waiting')
    `);
    await db.run(`
      INSERT INTO player_items VALUES
      ('Host 1', 1, 1, 0, ''), ('Host 1', 1, 2, 0, '')
    `);

    // Perform the POST request to the /join endpoint
    const res = await axios.post(`http://localhost:${PORT}/api/join`, {
      lobbyId: 1,
      userId: 'Player 1',
      pin: '1234'
    });

    expect(res.status).toBe(200);
    expect(res.data.message).toBe("User Player 1 joined lobby 1");

    // Ensure the lobbies table is updated
    const lobbies = await db.all(`SELECT * FROM lobbies`);
    expect(lobbies).toHaveLength(1);
    expect(lobbies[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '["Host 1","Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      points: '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]',
      pin: '1234',
      gameTime: 60,
      status: 'waiting'
    });

    // Ensure the player_items table is updated
    const player_items = await db.all(`SELECT * FROM player_items`);
    expect(player_items).toHaveLength(4);
    expect(player_items[0]).toMatchObject({ 
      player_id: 'Host 1', 
      lobby_id: 1, 
      item_id: 1, 
      found: 0, 
      image: '' 
    });
    expect(player_items[1]).toMatchObject({ 
      player_id: 'Host 1', 
      lobby_id: 1, 
      item_id: 2, 
      found: 0, 
      image: '' 
    });
    expect(player_items[2]).toMatchObject({ 
      player_id: 'Player 1', 
      lobby_id: 1, 
      item_id: 1, 
      found: 0, 
      image: '' 
    });
    expect(player_items[3]).toMatchObject({ 
      player_id: 'Player 1', 
      lobby_id: 1, 
      item_id: 2, 
      found: 0, 
      image: '' 
    });
  });

  test('POST /join with incorrect PIN should return error', async () => {
    try {
      await axios.post(`http://localhost:${PORT}/api/join`, {
        lobbyId: 1,
        userId: 'Player 1',
        pin: '1234',
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(404);
        expect(error.response?.data).toMatchObject({
          error: 'Lobby not found or PIN is incorrect',
        });
      } else {
        throw error;
      }
    }
  }); 
  
  test('POST /join with player already in the lobby should not create new entry', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]', 
      '[{"id":"Host 1","points":0}]', '1234', 60, 'waiting')
    `);
    await db.run(`
      INSERT INTO player_items VALUES
      ('Host 1', 1, 1, 0, ''), ('Host 1', 1, 2, 0, '')
    `);
  
    const res = await axios.post(`http://localhost:${PORT}/api/join`, {
      lobbyId: 1,
      userId: 'Host 1',
      pin: '1234',
    });
  
    expect(res.status).toBe(200);
    expect(res.data.message).toBe("User Host 1 joined lobby 1");
  
    // Ensure the lobbies table is the same
    const lobbies = await db.all(`SELECT * FROM lobbies`);
    expect(lobbies).toHaveLength(1);
    expect(lobbies[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '["Host 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      points: '[{"id":"Host 1","points":0}]',
      pin: '1234',
      gameTime: 60,
      status: 'waiting'
    });

    // Ensure the player_items table is updated
    const player_items = await db.all(`SELECT * FROM player_items`);
    expect(player_items).toHaveLength(2);
    expect(player_items[0]).toMatchObject({ 
      player_id: 'Host 1', 
      lobby_id: 1, 
      item_id: 1, 
      found: 0, 
      image: '' 
    });
    expect(player_items[1]).toMatchObject({ 
      player_id: 'Host 1', 
      lobby_id: 1, 
      item_id: 2, 
      found: 0, 
      image: '' 
    });
  });    
});