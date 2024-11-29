/* 
------------------------------------------------------
Server Tests for Waiting in Lobbies
Routes: /players, /start
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

describe('/players tests', () => {
  test('GET /players should return players of the given lobby', async () => {
    // Create a lobby with players
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);

    // Perform the GET request to the appropriate /players endpoint
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies/1/players`);
    expect(res.status).toBe(200);
    expect(res.data.players).toHaveLength(2);
    expect(res.data.players).toMatchObject(["Host 1", "Player 1"]);
  });

  test('GET /players with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);

    try {
      await axios.get(`http://localhost:${PORT}/api/lobbies/2/players`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(404);
        expect(error.response?.data).toMatchObject({
          error: 'Lobby not found',
        });
      } else {
        throw error;
      }
    }
  });

  test('GET /players with invalid players should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby', 'Host 1', 'invalid data', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]', 
      '[{"id":"Host 1","points":0}]', '1234', 60, 'waiting')
    `);
  
    try {
      await axios.get(`http://localhost:${PORT}/api/lobbies/1/players`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to retrieve players',
        });
      } else {
        throw error;
      }
    }
  });
});

describe('/start tests', () => {
  test('POST /start should change lobby status to started', async () => {
    // Create a lobby that will be started
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0}]', '1234', 60, 'waiting')
    `);

    // Perform the POST request to the appropriate /start endpoint
    const res = await axios.post(`http://localhost:${PORT}/api/lobbies/1/start`);
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ message: `Lobby 1 started` });

    // Ensure the lobby in lobbies table has its status updated
    const lobbies = await db.all(`SELECT * FROM lobbies`);
    expect(lobbies).toHaveLength(1);
    expect(lobbies[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '["Host 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      points: '[{"id":"Host 1","points":0}]',
      pin: '1234',
      gameTime: 60,
      status: 'started'
    });
  });

  test('POST /start with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0}]', '1234', 60, 'waiting')
    `);

    try {
      await axios.post(`http://localhost:${PORT}/api/lobbies/2/start`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(404);
        expect(error.response?.data).toMatchObject({
          error: 'Lobby not found',
        });
      } else {
        throw error;
      }
    }
  });
});