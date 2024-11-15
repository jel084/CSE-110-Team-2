import express from 'express';
import { connectDB } from './db';

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


const parseJsonField = (field: string | null) => {
  try {
      return field ? JSON.parse(field) : {};
  } catch (error) {
      console.error("Failed to parse JSON field:", error);
      return {}; 
  }
};

export default router;
