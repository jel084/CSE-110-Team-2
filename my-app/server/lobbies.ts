import { Request, Response } from 'express';
import { connectDB } from './db';

export const createLobby = async (req: Request, res: Response) => {
  const { lobbyName, scavengerItems, userId, pin } = req.body;

  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'A valid 4-digit PIN is required' });
  }

  try {
    const db = await connectDB();

    // Ensure scavengerItems is an array of objects
    if (!Array.isArray(scavengerItems) || !scavengerItems.every(item => typeof item === 'object')) {
      return res.status(400).json({ error: 'Scavenger items must be an array of objects' });
    }

    const result = await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      lobbyName,
      userId,
      JSON.stringify([]),  // Initialize players as empty array
      JSON.stringify(scavengerItems),  // Properly formatted scavenger items array
      JSON.stringify([]),  // Initialize points as empty array
      pin
    ]);

    res.status(201).json({ lobbyId: result.lastID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create lobby' });
  }
};

export const joinLobby = async (req: Request, res: Response) => {
  const { lobbyId, userId, pin } = req.body;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby does not exist' });
    }

    if (lobby.pin !== pin) {
      return res.status(403).json({ error: 'Incorrect PIN' });
    }

    const players = JSON.parse(lobby.players || '[]');
    let pointsArray = JSON.parse(lobby.points || '[]');

    if (!players.includes(userId)) {
      players.push(userId);
      pointsArray.push({ id: userId, points: 0 });

      await db.run(`
        UPDATE lobbies SET players = ?, points = ? WHERE id = ?
      `, [JSON.stringify(players), JSON.stringify(pointsArray), lobbyId]);
    }

    res.status(200).json({ message: 'Joined lobby successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to join lobby' });
  }
};
