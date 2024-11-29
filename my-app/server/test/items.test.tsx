/* 
------------------------------------------------------
Server Tests for Scavenger Screen
Routes: /items, /upload, /deleteImage
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
const FormData = require('form-data');
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

describe('/items tests', () => {
  test('GET /items should return items of the given lobby', async () => {
    // Create a lobby with items
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      '[{"id":"Host 1","points":0}]', '1234', 60, 'waiting')
    `);

    // Perform the GET request to the appropriate /items endpoint
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies/1/players/Host 1/items`);
    expect(res.status).toBe(200);
    expect(res.data).toHaveLength(2);
    expect(res.data).toMatchObject([
      {id: 1, name: "Triton Statue", points: 10, found: false},
      {id: 2, name: "Sun God", points: 10, found: false}
    ]);
  });

  test('GET /items with empty scavengerItems should return empty array', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby', 'Host 1', '["Host 1"]', '[]', '[{"id":"Host 1","points":0}]', '1234', 60, 'waiting')
    `);
  
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies/1/players/Host 1/items`);
    expect(res.status).toBe(200);
    expect(res.data.items).toHaveLength(0);
  });  

  test('GET /items with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      '[{"id":"Host 1","points":0}]', '1234', 60, 'waiting')
    `);

    try {
      await axios.get(`http://localhost:${PORT}/api/lobbies/2/players/Host 1/items`);
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

  test('GET /items with invalid scavengerItems should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby', 'Host 1', '["Host 1"]', 'invalid data', '[{"id":"Host 1","points":0}]', '1234', 60, 'waiting')
    `);
  
    try {
      await axios.get(`http://localhost:${PORT}/api/lobbies/1/players/Host 1/items`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to retrieve items',
        });
      } else {
        throw error;
      }
    }
  });
});

describe('/upload tests', () => {
  test('PUT /upload should mark the given item for the given player', async () => {
    // Create a lobby for a player to upload an image
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Host 1","Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Host 1","points":0},{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
    await db.run(`
      INSERT INTO player_items VALUES
      ('Host 1', 1, 1, 0, ''), ('Player 1', 1, 1, 0, '')
    `);

    // Read the contents of /uploads to get all images before new image is added
    const uploads = await fs.promises.readdir('uploads');

    // Perform the PUT request to the appropriate /upload endpoint
    const formData = new FormData();
    formData.append('image', fs.createReadStream('client/public/bg_img.jpg'));
    formData.append('lobbyId', '1');
    formData.append('userId', 'Player 1');
    formData.append('itemId', '1');
    const res = await axios.put(
      `http://localhost:8080/api/lobbies/1/players/Player 1/items/1/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('item');

    // Get name of new upload and verify the image field is updated
    const newUploads = await fs.promises.readdir('uploads');
    const addedFiles = newUploads.filter((upload: string) => !uploads.includes(upload));
    expect(res.data.item).toMatchObject({
      player_id: 'Player 1',
      lobby_id: 1,
      item_id: 1,
      found: 1,
      image: `/uploads/${addedFiles[0]}`
    });
    fs.unlinkSync(`uploads/${addedFiles[0]}`);
  });

  test('PUT /upload with invalid item id should return error', async () => {
    await db.run(`
      INSERT INTO player_items (player_id, lobby_id, item_id, found, image) VALUES
      ('Player 1', 1, 1, false, '')
    `);
  
    try {
      await axios.put(`http://localhost:${PORT}/api/lobbies/1/players/Player 1/items/2/upload`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(404);
        expect(error.response?.data).toMatchObject({
          error: 'Player item not found',
        });
      } else {
        throw error;
      }
    }
  });

  test('PUT /upload with no image should return error', async () => {
    await db.run(`
      INSERT INTO player_items (player_id, lobby_id, item_id, found, image) VALUES
      ('Player 1', 1, 1, false, '')
    `);
  
    try {
      await axios.put(`http://localhost:${PORT}/api/lobbies/1/players/Player 1/items/1/upload`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to upload image or mark item',
        });
      } else {
        throw error;
      }
    }
  });
});

// deleteImage tests to be created