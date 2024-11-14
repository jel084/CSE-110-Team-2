import { Request, Response } from 'express';
import { connectDB } from '../db';

const parseJsonField = (field: string | null) => {
  return field ? JSON.parse(field) : [];
};

export const createLobby = async (req: Request, res: Response) => {
  const { lobbyName, scavengerItems, userId, pin } = req.body;

 
  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'A valid 4-digit PIN is required' });
  }

  try {
    const db = await connectDB();

    const result = await db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      lobbyName,
      userId,
      JSON.stringify([]),           
      JSON.stringify(scavengerItems), 
      JSON.stringify({}),             
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

    const players = parseJsonField(lobby.players);
    if (players.includes(userId) || userId === lobby.host) {
      return res.status(400).json({ error: 'User already in lobby or is the host' });
    }

    players.push(userId);
    const points = parseJsonField(lobby.points);
    points[userId] = 0;

    await db.run(`
      UPDATE lobbies SET players = ?, points = ? WHERE id = ?
    `, [JSON.stringify(players), JSON.stringify(points), lobbyId]);

    res.status(200).json({ message: 'Joined lobby successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to join lobby' });
  }
};

export const getAllLobbies = async (req: Request, res: Response) => {
  try {
    const db = await connectDB();
    const lobbies = await db.all(`SELECT * FROM lobbies`);

    const parsedLobbies = lobbies.map((lobby: { players: string | null; scavengerItems: string | null; points: string | null; }) => ({
      ...lobby,
      players: parseJsonField(lobby.players), 
      scavengerItems: parseJsonField(lobby.scavengerItems),
      points: parseJsonField(lobby.points), 
    }));

    res.status(200).json(parsedLobbies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve lobbies' });
  }
};
