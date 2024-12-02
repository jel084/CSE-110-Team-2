import { Request, Response } from 'express';
import { connectDB } from './db';

export const createLobby = async (req: Request, res: Response) => {
  const { lobbyName, scavengerItems, userId, pin, gameTime } = req.body;

  console.log('Creating lobby with gameTime:', gameTime);

  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'A valid 4-digit PIN is required' });
  }

  try {
    const db = await connectDB();

    const result = await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, status, gameTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      lobbyName,
      userId,
      JSON.stringify([]),  
      JSON.stringify(scavengerItems),
      JSON.stringify([]),  
      pin,
      'waiting',
      gameTime  
    ]);
  
    res.status(201).json({ lobbyId: result.lastID });
  } catch (error) {
    console.error('Error creating lobby:', error);
    res.status(500).json({ error: 'Failed to create lobby' });
  }
};

export const joinLobby = async (req: Request, res: Response) => {
  const { lobbyId, userId, userName, pin } = req.body; 

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
      
      pointsArray.push({ id: userId, name: userName, points: 0 });

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