/* 
------------------------------------------------------
Server Tests for Game Timer
Routes: /gameTime, /setTime
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

describe('/gameTime tests', () => {
  test('GET /gameTime should return the time remaining for the given lobby', async () => {
    // Create a lobby with a time set
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);

    // Perform the GET request to the appropriate /players endpoint
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies/1/gameTime`);
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ gameTime: 60 });
  });

  test('GET /gameTime with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);

    try {
      await axios.get(`http://localhost:${PORT}/api/lobbies/2/gameTime`);
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

  test('GET /gameTime with missing game time should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, status) VALUES
      ('New Lobby', 'Host 1', '["Host 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]', 
      '[{"id":"Host 1","points":0}]', '1234', 'waiting')
    `);
  
    try {
      await axios.get(`http://localhost:${PORT}/api/lobbies/1/gameTime`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Invalid game time data',
        });
      } else {
        throw error;
      }
    }
  });

  test('GET /gameTime with missing game time should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby', 'Host 1', '["Host 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]', 
      '[{"id":"Host 1","points":0}]', '1234', 'invalid data', 'waiting')
    `);
  
    try {
      await axios.get(`http://localhost:${PORT}/api/lobbies/1/gameTime`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to retrieve gameTime',
        });
      } else {
        throw error;
      }
    }
  });
});

describe('/setTime tests', () => {
  test('POST /setTime should update the time remaining for the given lobby', async () => {
    // Create a lobby with time set
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);

    // Perform the POST request to the appropriate /setTime endpoint
    const res = await axios.post(`http://localhost:${PORT}/api/lobbies/1/59/setTime`);
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ message: 'Game time updated successfully' });

    // Ensure the lobbies table is updated
    const lobbies = await db.all(`SELECT * FROM lobbies`);
    expect(lobbies).toHaveLength(1);
    expect(lobbies[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '["Host 1","Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      points: '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]',
      pin: '1234',
      gameTime: 59,
      status: 'waiting'
    });
  });

  test('POST /setTime with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);

    try {
      await axios.post(`http://localhost:${PORT}/api/lobbies/2/59/setTime`);
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

  test('POST /setTime with invalid time should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
  
    try {
      await axios.post(`http://localhost:${PORT}/api/lobbies/1/invalid data/setTime`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to update gameTime',
        });
      } else {
        throw error;
      }
    }
  });
});