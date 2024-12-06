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
    fs.unlinkSync('server/database.sqlite'); // Automatically delete database.sqlite after all tests are done
    server.close(); // Stop the server after tests
});

beforeEach(async () => {
  await initDatabase();
});

describe('/lobbies tests', () => {
  test('GET /lobbies should show all lobbies', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '[]', '[]', '[]', '1234', 21, 'waiting'),
      ('New Lobby 2', 'Host 2', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]', 
      '[{"id":"Player 1","points":0}]', '5678', 22, 'in-progress')
    `);

    // Perform the GET request to the /lobbies endpoint
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies`);
    expect(res.status).toBe(200);
    expect(res.data).toHaveLength(2);
    expect(res.data[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '[]',
      scavengerItems: '[]',
      points: '[]',
      pin: '1234',
      gameTime: 21,
      status: 'waiting',
    });
    expect(res.data[1]).toMatchObject({
      lobbyName: 'New Lobby 2',
      host: 'Host 2',
      players: '["Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      points: '[{"id":"Player 1","points":0}]',
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
    expect(res.data.lobbyId).toBe(1);

    // Ensure the lobbies table is updated
    const lobbies = await db.all(`SELECT * FROM lobbies`);
    expect(lobbies).toHaveLength(1);
    expect(lobbies[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '[]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      points: '[]',
      pin: '1234',
      gameTime: 50,
      status: 'waiting'
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
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to create lobby',
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
      ('New Lobby 1', 'Host 1', '[]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]', 
      '[]', '1234', 60, 'waiting')
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
      players: '["Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      points: '[{"id":"Player 1","points":0}]',
      pin: '1234',
      gameTime: 60,
      status: 'waiting'
    });

    // Ensure the player_items table is updated
    const player_items = await db.all(`SELECT * FROM player_items`);
    expect(player_items).toHaveLength(2);
    expect(player_items[0]).toMatchObject({ 
      player_id: 'Player 1', 
      lobby_id: 1, 
      item_id: 1, 
      found: 0, 
      image: '' 
    });
    expect(player_items[1]).toMatchObject({ 
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
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]', 
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
    await db.run(`
      INSERT INTO player_items VALUES
      ('Player 1', 1, 1, 0, ''), ('Player 1', 1, 2, 0, '')
    `);
  
    const res = await axios.post(`http://localhost:${PORT}/api/join`, {
      lobbyId: 1,
      userId: 'Player 1',
      pin: '1234',
    });
  
    expect(res.status).toBe(200);
    expect(res.data.message).toBe("User Player 1 joined lobby 1");
  
    // Ensure the lobbies table is the same
    const lobbies = await db.all(`SELECT * FROM lobbies`);
    expect(lobbies).toHaveLength(1);
    expect(lobbies[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '["Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      points: '[{"id":"Player 1","points":0}]',
      pin: '1234',
      gameTime: 60,
      status: 'waiting'
    });

    // Ensure the player_items table is updated
    const player_items = await db.all(`SELECT * FROM player_items`);
    expect(player_items).toHaveLength(2);
    expect(player_items[0]).toMatchObject({ 
      player_id: 'Player 1', 
      lobby_id: 1, 
      item_id: 1, 
      found: 0, 
      image: '',
      approved: 0
    });
    expect(player_items[1]).toMatchObject({ 
      player_id: 'Player 1', 
      lobby_id: 1, 
      item_id: 2, 
      found: 0, 
      image: '', 
      approved: 0
    });
  });    
});

describe('/update-points tests', () => {
  test('POST /update-points should update points for the given player', async () => {
    // Create a lobby with players
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
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
      players: '["Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      points: '[{"id":"Player 1","points":10}]',
      pin: '1234',
      gameTime: 60,
      status: 'waiting'
    });
  });

  test('POST /update-points with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
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
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
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
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
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

describe('/items tests', () => {
  test('GET /items should return items of the player from the given lobby', async () => {
    // Create a lobby with items
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1", "Player 2"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      '[{"id":"Player 1","points":0},{"id":"Player 2","points":10}]', '1234', 60, 'waiting')
    `);
    await db.run(`
      INSERT INTO player_items VALUES
      ('Player 1', 1, 1, 0, ''), ('Player 1', 1, 2, 0, ''),
      ('Player 2', 1, 1, 0, ''), ('Player 2', 1, 2, 1, 'test.jpg')
    `);

    // Perform the GET request to the appropriate /items endpoint
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies/1/players/Player 2/items`);
    expect(res.status).toBe(200);
    expect(res.data).toHaveLength(2);
    expect(res.data).toMatchObject([
      {id: 1, name: "Triton Statue", points: 10, found: 0, image: '', approved: 0},
      {id: 2, name: "Sun God", points: 10, found: 1, image: 'test.jpg', approved: 0}
    ]);
  });

  test('GET /items with empty scavengerItems should return empty array', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby', 'Host 1', '[]', '[]', '[]', '1234', 60, 'waiting')
    `);
  
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies/1/players/Host 1/items`);
    expect(res.status).toBe(200);
    expect(res.data.items).toHaveLength(0);
  });  

  test('GET /items with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '[]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      '[]', '1234', 60, 'waiting')
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
      ('New Lobby', 'Host 1', '[]', 'invalid data', '[]', '1234', 60, 'waiting')
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
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
    await db.run(`
      INSERT INTO player_items VALUES
      ('Player 1', 1, 1, 0, '', 0)
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
      image: `/uploads/${addedFiles[0]}`,
      approved: 0
    });
    fs.unlinkSync(`uploads/${addedFiles[0]}`);
  });

  test('PUT /upload with invalid item id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
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
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
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

describe('/deleteImage tests', () => {
  test('DELETE /deleteImage should delete the image from uploads', async () => {
    // Create a lobby for a player to delete an image
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":10}]', '1234', 60, 'waiting')
    `);
    await db.run(`
      INSERT INTO player_items VALUES
      ('Player 1', 1, 1, 1, 'uploads/test.jpg', 0)
    `);

    // Copy an image to the uploads file
    fs.copyFile('client/public/bg_img.jpg', 'uploads/test.jpg', (err: any) => {
      if (err) {
        console.error('Error copying the image:', err);
      } else {
        console.log('Image copied successfully to', 'uploads/test.jpg');
      }
    });

    // Perform the DELETE request to the appropriate /deleteImage endpoint
    const res = await axios.delete(`http://localhost:8080/api/lobbies/1/players/Player 1/items/1/deleteImage`);
    expect(res.status).toBe(200);
    expect(res.data.message).toBe('Image deleted successfully');

    // Get uploads and verify the image is deleted
    const uploads = await fs.promises.readdir('uploads');
    expect(uploads.includes('test.jpg')).toBe(false);

    // Ensure the player_items table is updated
    const player_items = await db.all('SELECT * FROM player_items');
    expect(player_items[0]).toMatchObject({
      player_id: 'Player 1',
      lobby_id: 1,
      item_id: 1,
      found: 0,
      image: '',
      approved: 0
    });
  });

  test('PUT /deleteImage with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
    await db.run(`
      INSERT INTO player_items (player_id, lobby_id, item_id, found, image, approved) VALUES
      ('Player 1', 1, 1, false, '', 0)
    `);
  
    try {
      await axios.delete(`http://localhost:${PORT}/api/lobbies/2/players/Player 1/items/1/deleteImage`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to delete image',
        });
      } else {
        throw error;
      }
    }
  });
});

describe('/players tests', () => {
  test('GET /players should return players of the given lobby', async () => {
    // Create a lobby with players
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1", "Player 2"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0},{"id":"Player 2","points":0}]', '1234', 60, 'waiting')
    `);

    // Perform the GET request to the appropriate /players endpoint
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies/1/players`);
    expect(res.status).toBe(200);
    expect(res.data.players).toHaveLength(2);
    expect(res.data.players).toMatchObject(["Player 1", "Player 2"]);
  });

  test('GET /players with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
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
      '[]', '1234', 60, 'waiting')
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

describe('/gameTime tests', () => {
  test('GET /gameTime should return the time remaining for the given lobby', async () => {
    // Create a lobby with a time set
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);

    // Perform the GET request to the appropriate /players endpoint
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies/1/gameTime`);
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ gameTime: 60 });
  });

  test('GET /gameTime with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
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

  test('GET /gameTime with invalid game time should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby', 'Host 1', '[]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]', 
      '[]', '1234', 'invalid data', 'waiting')
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
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
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
      players: '["Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      points: '[{"id":"Player 1","points":0}]',
      pin: '1234',
      gameTime: 59,
      status: 'waiting'
    });
  });

  test('POST /setTime with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
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
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
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

describe('/start tests', () => {
  test('POST /start should change lobby status to started', async () => {
    // Create a lobby that will be started
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
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
      players: '["Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      points: '[{"id":"Player 1","points":0}]',
      pin: '1234',
      gameTime: 60,
      status: 'started'
    });
  });

  test('POST /start with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '[]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[]', '1234', 60, 'waiting')
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

describe('/end tests', () => {
  test('POST /end should change lobby status to started', async () => {
    // Create a lobby that will be ended
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'started')
    `);

    // Perform the POST request to the appropriate /end endpoint
    const res = await axios.post(`http://localhost:${PORT}/api/lobbies/1/end`);
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ message: `Lobby 1 ended successfully` });

    // Ensure the lobby in lobbies table has its status updated
    const lobbies = await db.all(`SELECT * FROM lobbies`);
    expect(lobbies).toHaveLength(1);
    expect(lobbies[0]).toMatchObject({
      lobbyName: 'New Lobby 1',
      host: 'Host 1',
      players: '["Player 1"]',
      scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      points: '[{"id":"Player 1","points":0}]',
      pin: '1234',
      gameTime: 60,
      status: 'ended'
    });
  });

  test('POST /end with invalid lobby id should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '[]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[]', '1234', 60, 'started')
    `);

    try {
      await axios.post(`http://localhost:${PORT}/api/lobbies/2/end`);
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

describe('/score tests', () => {
  test('GET /score should return the scores of the given lobby', async () => {
    // Insert a lobby with points
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":10}]', '1234', 60, 'started')
    `);

    // Perform the GET request to the appropriate /scores endpoint
    const res = await axios.get(`http://localhost:${PORT}/api/lobbies/1/score`);
    expect(res.status).toBe(200);
    expect(res.data.players).toMatchObject([
        { id: 'Player 1', points: 10 }
    ]);
  });

  test('GET /score with invalid lobby id should return error', async () => {
    try {
      await axios.get(`http://localhost:${PORT}/api/lobbies/2/score`);
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

  test('GET /score with invalid points should return error', async () => {
    await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      'invalid data', '1234', 60, 'started')
    `);

    try {
      await axios.get(`http://localhost:${PORT}/api/lobbies/1/score`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toMatchObject({
          error: 'Failed to retrieve lobby score',
        });
      } else {
        throw error;
      }
    }
  });
});