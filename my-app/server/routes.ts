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
  const { lobbyName, scavengerItems, userId, gameTime, pin } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Host userId is required' });
  }

  try {
    const db = await connectDB();

    // Insert the new lobby
    await db.run(
      `INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lobbyName,
        userId,
        JSON.stringify([userId]), // Add host to players immediately
        JSON.stringify(scavengerItems),
        JSON.stringify([{ id: userId, points: 0 }]), // Add initial points for the host
        pin,
        gameTime,
        'waiting'
      ]
    );

    // Retrieve the newly created lobby to get its ID
    const newLobby = await db.get(`SELECT * FROM lobbies WHERE host = ? ORDER BY id DESC LIMIT 1`, [userId]);
    const lobbyId = newLobby.id;

    // Add scavenger items for the host into the `player_items` table
    if (Array.isArray(scavengerItems) && scavengerItems.length > 0) {
      for (let item of scavengerItems) {
        await db.run(
          `INSERT OR IGNORE INTO player_items (player_id, lobby_id, item_id, found, image)
          VALUES (?, ?, ?, ?, ?)`,
          [userId, lobbyId, item.id, false, '']
        );
      }
    }

    res.status(201).json({ message: `Lobby '${lobbyName}' created by ${userId}`, lobbyId });
  } catch (error) {
    console.error('Error creating lobby:', error);
    res.status(500).json({ error: 'Failed to create lobby' });
  }
});

router.post('/join', async (req, res) => {
  const {userId, pin } = req.body;
  try {
    const db = await connectDB();

    const lobby = await db.get(`SELECT * FROM lobbies WHERE pin = ?`, [pin]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found or PIN is incorrect' });
    }

    const players = JSON.parse(lobby.players || '[]');
    let pointsArray = JSON.parse(lobby.points || '[]');
    const lobbyId = JSON.parse(lobby.id );

    if (!Array.isArray(pointsArray)) {
      pointsArray = [];
    }

    if (!players.includes(userId)) {
      players.push(userId);
      pointsArray.push({ id: userId, points: 0 });

      await db.run(
        `UPDATE lobbies SET players = ?, points = ? WHERE pin = ?`,
        [JSON.stringify(players), JSON.stringify(pointsArray), pin]
      );

      // Insert items for the player into player_items
      let scavengerItems = JSON.parse(lobby.scavengerItems || '[]');
      for (let item of scavengerItems) {
        await db.run(
          `INSERT OR IGNORE INTO player_items (player_id, lobby_id, item_id, found, image)
          VALUES (?, ?, ?, ?, ?)`,
          [userId, lobbyId, item.id, false, '']
        );
      }
    }

    res.json({ message: `User ${userId} joined lobby ${lobbyId}`, lobbyId });
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

    // Get the player's specific item
    const playerItem = await db.get(
      `SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`,
      [lobbyId, userId, itemId]
    );

    if (!playerItem) {
      return res.status(404).json({ error: 'Player item not found' });
    }

    // Update the item to mark it as found and add the image
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    await db.run(
      `UPDATE player_items SET found = ?, image = ? WHERE lobby_id = ? AND player_id = ? AND item_id = ?`,
      [true, imageUrl, lobbyId, userId, itemId]
    );

    // Re-fetch the updated item after updating the database
    const updatedPlayerItem = await db.get(
      `SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`,
      [lobbyId, userId, itemId]
    );

    // Return the updated item
    res.status(200).json({ message: 'Item marked successfully and image uploaded', item: updatedPlayerItem });
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

router.get('/lobbies/:lobbyId/gameTime', async (req, res) => {
  const { lobbyId } = req.params;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    const gameTime = JSON.parse(lobby.gameTime || '0');

    // Ensure players is an array of strings
    if (!gameTime) {
      return res.status(500).json({ error: 'Invalid game time data' });
    }

    res.status(200).json({ gameTime });
  } catch (error) {
    console.error('Error retrieving gameTime:', error);
    res.status(500).json({ error: 'Failed to retrieve gameTime'});
  }
});

router.post('/lobbies/:lobbyId/:timeRemaining/setTime', async (req, res) => {
  const { lobbyId, timeRemaining } = req.params;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    await db.run(`UPDATE lobbies SET gameTime = ? WHERE id = ?`, [timeRemaining, lobbyId]);

    res.status(200).json({ message: 'Game time updated successfully' });
  } 
  catch (error) {
    console.error('Error updating gameTime:', error);
    res.status(500).json({ error: 'Failed to update gameTime' });
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

    // Update lobby status to started
    await db.run(`UPDATE lobbies SET status = ? WHERE id = ?`, ['started', lobbyId]);

    res.status(200).json({ message: `Lobby ${lobbyId} started` });
  } catch (error) {
    console.error('Error starting lobby:', error);
    res.status(500).json({ error: 'Failed to start lobby' });
  }
});

export default router;
