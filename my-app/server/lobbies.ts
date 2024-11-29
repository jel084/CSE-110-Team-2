import { Request, Response } from 'express';
import { connectDB } from './db';

export const createLobby = async (req: Request, res: Response) => {
  const { lobbyName, scavengerItems, userId, userName, pin } = req.body;

  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'A valid 4-digit PIN is required' });
  }

  try {
    const db = await connectDB();

    const pointsArray = [{}]; // Updated to include the player's name

    const result = await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      lobbyName,
      JSON.stringify([]),  // Initialize players with host
      JSON.stringify(scavengerItems),
      JSON.stringify(pointsArray),  // Initialize points including player name
      pin
    ]);

    res.status(201).json({ lobbyId: result.lastID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create lobby' });
  }
};

export const joinLobby = async (req: Request, res: Response) => {
  const { lobbyId, userId, userName, pin } = req.body; // Added userName

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

    // If the user is not in the lobby, add them
    if (!players.includes(userId)) {
      players.push(userId);
      
      // Add player to the points array including their name
      pointsArray.push({ id: userId, name: userName, points: 0 });

      // Update the database with the new players list and points array
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