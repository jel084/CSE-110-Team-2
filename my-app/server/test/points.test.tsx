/* 
------------------------------------------------------
Server Tests for Point System
Routes: /update-points, /score
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

describe('/update-points tests', () => {
  test('POST /update-points should update points for the given player', async () => {
    // Create a lobby with players
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);

    // Perform the POST request to the /update-points endpoint
    const res = await axios.post(`http://localhost:${PORT}/api/update-points`, {
      lobbyId: 1,
      userId: 'Player 1',
      points: 10,
    });
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ message: 'Points updated successfully' });

    // Ensure the lobbies table is updated
    const lobbies = await db.all(`SELECT * FROM lobbies`);
    expect(lobbies).toHaveLength(1);
    expect(lobbies[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '["Host 1","Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      points: '[{"id":"Host 1","points":0},{"id":"Player 1","points":10}]',
      pin: '1234',
      gameTime: 60,
      status: 'waiting'
    });
  });

  test('POST /update-points with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);

    try {
      await axios.post(`http://localhost:${PORT}/api/update-points`, {
        lobbyId: 2,
        userId: 'Player 1',
        points: 10,
      });
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

  test('POST /update-points with invalid user id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);

    try {
      await axios.post(`http://localhost:${PORT}/api/update-points`, {
        lobbyId: 1,
        userId: 'Player 2',
        points: 10,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(404);
        expect(error.response?.data).toMatchObject({
          error: 'User not found in lobby',
        });
      } else {
        throw error;
      }
    }
  });

  test('POST /update-points with invalid points should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
  
    try {
      await axios.post(`http://localhost:${PORT}/api/update-points`, {
        lobbyId: 1,
        userId: 'Player 1',
        points: 'invalid data',
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to update points',
        });
      } else {
        throw error;
      }
    }
  });
});

// describe('/score tests', () => {
//   test('GET /score should return the scores of the given lobby', async () => {
//     // Insert a lobby with points
//     await db.run(`
//       INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
//       ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
//       '[{"id":"Host 1","points":0},{"id":"Player 1","points":10}]', '1234', 60, 'started')
//     `);

//     // Perform the GET request to the appropriate /scores endpoint
//     const res = await axios.get(`http://localhost:${PORT}/lobbies/1/score`);
//     expect(res.status).toBe(200);
//     console.log(res.data);
//     expect(res.data).toMatchObject([
//         { id: 'Host 1', points: 0 },
//         { id: 'Player 1', points: 10 }
//     ]);
//   });

//   test('GET /score with invalid lobby id should return error', async () => {
//     try {
//       await axios.get(`http://localhost:${PORT}/lobbies/2/score`);
//     } catch (error: unknown) {
//       if (axios.isAxiosError(error)) {
//         expect(error.response?.status).toBe(404);
//         expect(error.response?.data).toMatchObject({
//           error: 'Lobby not found',
//         });
//       } else {
//         throw error;
//       }
//     }
//   });

//   test('GET /score with invalid points should return error', async () => {
//     await db.run(`
//       INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
//       ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
//       'invalid data', '1234', 60, 'started')
//     `);

//     try {
//       await axios.get(`http://localhost:${PORT}/lobbies/1/score`);
//     } catch (error: unknown) {
//       if (axios.isAxiosError(error)) {
//         expect(error.response?.status).toBe(500);
//         expect(error.response?.data).toMatchObject({
//           error: 'Invalid points data',
//         });
//       } else {
//         throw error;
//       }
//     }
//   });
// });