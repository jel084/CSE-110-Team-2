import express from 'express';
import { connectDB } from './db';
import multer from 'multer';
import path from 'path';

const router = express.Router();

router.get('/lobbies', async (req, res) => {
  try {
    const db = await connectDB();
    const lobbies = await db.all('SELECT * FROM lobbies');
    res.json(lobbies);
  } catch (error) {
    console.error('Error retrieving lobbies:', error);
    res.status(500).json({ error: 'Failed to retrieve lobbies' });
  }
});

router.post('/create', async (req, res) => {
  const { lobbyName, scavengerItems, userId, pin } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Host userId is required' });
  }

  try {
    const db = await connectDB();
    await db.run(
      `INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        lobbyName,
        userId,  
        JSON.stringify([]),  
        JSON.stringify(scavengerItems),
        JSON.stringify([]),  
        pin,
        'waiting'
      ]
    );
    res.status(201).json({ message: `Lobby '${lobbyName}' created by ${userId}` });
  } catch (error) {
    console.error('Error creating lobby:', error);
    res.status(500).json({ error: 'Failed to create lobby' });
  }
});

router.post('/join', async (req, res) => {
  const { lobbyId, userId, pin } = req.body;
  try {
    const db = await connectDB();

    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ? AND pin = ?`, [lobbyId, pin]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found or PIN is incorrect' });
    }

    const players = JSON.parse(lobby.players || '[]');
    let pointsArray = JSON.parse(lobby.points || '[]');

    if (!Array.isArray(pointsArray)) {
      pointsArray = [];
    }

    if (!players.includes(userId)) {
      players.push(userId);
      pointsArray.push({ id: userId, points: 0 }); 

      await db.run(
        `UPDATE lobbies SET players = ?, points = ? WHERE id = ?`,
        [JSON.stringify(players), JSON.stringify(pointsArray), lobbyId]
      );
    }

    res.json({ message: `User ${userId} joined lobby ${lobbyId}` });
  } catch (error) {
    console.error('Error joining lobby:', error);
    res.status(500).json({ error: 'Failed to join lobby' });
  }
});

router.post('/update-points', async (req, res) => {
  const { lobbyId, userId, points } = req.body;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    let pointsArray = JSON.parse(lobby.points || '[]');

    const player = pointsArray.find((p: { id: string; points: number }) => p.id === userId);
    if (!player) {
      return res.status(404).json({ error: 'User not found in lobby' });
    }

    player.points += points;

    await db.run(`
      UPDATE lobbies SET points = ? WHERE id = ?
    `, [JSON.stringify(pointsArray), lobbyId]);

    res.status(200).json({ message: 'Points updated successfully' });
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ error: 'Failed to update points' });
  }
});

router.get('/lobbies/:lobbyId/players/:userId/items', async (req, res) => {
  const { lobbyId, userId } = req.params;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    let scavengerItems = JSON.parse(lobby.scavengerItems || '[]');

    // Ensure scavengerItems is an array of objects
    if (!Array.isArray(scavengerItems) || scavengerItems.length === 0) {
      return res.status(200).json({ items: [] });
    }

    // Properly return scavenger items
    res.status(200).json(scavengerItems);
  } catch (error) {
    console.error('Error retrieving items:', error);
    res.status(500).json({ error: 'Failed to retrieve items' });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure the "uploads" folder exists
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Image upload and mark item as found
router.put('/lobbies/:lobbyId/players/:userId/items/:itemId/upload', upload.single('image'), async (req, res) => {
  const { lobbyId, userId, itemId } = req.params;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    let scavengerItems = JSON.parse(lobby.scavengerItems || '[]');
    let pointsArray = JSON.parse(lobby.points || '[]');

    // Find the item and player
    const itemIndex = scavengerItems.findIndex((item: { id: number }) => item.id == parseInt(itemId));
    const player = pointsArray.find((p: { id: string }) => p.id === userId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Mark the item as found and assign image URL
    let item = scavengerItems[itemIndex];
    item.found = true;
    item.image = req.file ? `/uploads/${req.file.filename}` : ''; // Assign image URL

    // Update player points
    player.points += item.points;

    // Update the database
    scavengerItems[itemIndex] = item;
    await db.run(
      `UPDATE lobbies SET scavengerItems = ?, points = ? WHERE id = ?`,
      [JSON.stringify(scavengerItems), JSON.stringify(pointsArray), lobbyId]
    );

    res.status(200).json({ message: 'Item marked successfully and image uploaded', item });
  } catch (error) {
    console.error('Error uploading image or marking item:', error);
    res.status(500).json({ error: 'Failed to upload image or mark item' });
  }
});

router.get('/lobbies/:lobbyId/players', async (req, res) => {
  const { lobbyId } = req.params;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    const players = JSON.parse(lobby.players || '[]');

    // Ensure players is an array of strings
    if (!Array.isArray(players)) {
      return res.status(500).json({ error: 'Invalid players data' });
    }

    res.status(200).json({ players });
  } catch (error) {
    console.error('Error retrieving players:', error);
    res.status(500).json({ error: 'Failed to retrieve players' });
  }
});

router.post('/lobbies/:lobbyId/start', async (req, res) => {
  const { lobbyId } = req.params;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    // Update the lobby status to 'started'
    await db.run(`UPDATE lobbies SET status = ? WHERE id = ?`, ['started', lobbyId]);

    res.status(200).json({ message: 'Lobby has started successfully' });
  } catch (error) {
    console.error('Error starting the lobby:', error);
    res.status(500).json({ error: 'Failed to start the lobby' });
  }
});

export default router;
