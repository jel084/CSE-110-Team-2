import express from 'express';
import { connectDB } from './db';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { createLobby } from './lobbies';

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

router.post('/create', createLobby);

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

router.post('/lobbies/:lobbyId/end', async (req, res) => {
  const { lobbyId } = req.params;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    await db.run(`UPDATE lobbies SET status = ? WHERE id = ?`, ['ended', lobbyId]);

    res.status(200).json({ message: `Lobby ${lobbyId} ended successfully` });
  } catch (error) {
    console.error('Error ending lobby:', error);
    res.status(500).json({ error: 'Failed to end the lobby' });
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

router.post('/lobbies/:lobbyId/:userId/leave', async (req, res) => {
  const { lobbyId, userId } = req.params;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    let players = JSON.parse(lobby.players || '[]');
    let pointsArray = JSON.parse(lobby.points || '[]');
    let itemsArray = JSON.parse(lobby.scavengerItems || '[]');
    players = players.filter((name: string) => name !== userId);
    itemsArray = itemsArray.filter((i: { name: string; }) => i.name !== userId);
    pointsArray = pointsArray.filter((p: { id: string; }) => p.id !== userId);


    await db.run(`UPDATE lobbies SET players = ?, points = ?, scavengerItems = ? WHERE id = ?`, [JSON.stringify(players), JSON.stringify(pointsArray), JSON.stringify(itemsArray), lobbyId]);
      // Remove player's items from player_items
    await db.run(`DELETE FROM player_items WHERE player_id = ? AND lobby_id = ?`, [userId, lobbyId]);
    res.status(200).json({ message: `User ${userId} left lobby ${lobbyId}`, players });
  } catch (error) {
    console.error('Error leaving lobby:', error);
    res.status(500).json({ error: 'Failed to leave lobby' });
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

    if (!Array.isArray(scavengerItems) || scavengerItems.length === 0) {
      return res.status(200).json({ items: [] });
    }

    const playerItems = await db.all(`SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ?`, [lobbyId, userId]);

    const playerItemsMap = playerItems.reduce((map, item) => {
      map[item.item_id] = item;
      return map;
    }, {});

    scavengerItems = scavengerItems.map((item) => ({
      ...item,
      found: playerItemsMap[item.id]?.found ?? item.found,
      image: playerItemsMap[item.id]?.image ?? item.image
    }));

    res.status(200).json(scavengerItems);
  } catch (error) {
    console.error('Error retrieving items:', error);
    res.status(500).json({ error: 'Failed to retrieve items' });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// mark item as found
router.put('/lobbies/:lobbyId/players/:userId/items/:itemId/upload', upload.single('image'), async (req, res) => {
  const { lobbyId, userId, itemId } = req.params;

  try {
    const db = await connectDB();

    const playerItem = await db.get(
      `SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`,
      [lobbyId, userId, itemId]
    );

    if (!playerItem) {
      return res.status(404).json({ error: 'Player item not found' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    await db.run(
      `UPDATE player_items SET found = ?, image = ? WHERE lobby_id = ? AND player_id = ? AND item_id = ?`,
      [true, imageUrl, lobbyId, userId, itemId]
    );

    const updatedPlayerItem = await db.get(
      `SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`,
      [lobbyId, userId, itemId]
    );

    res.status(200).json({ message: 'Item marked successfully and image uploaded', item: updatedPlayerItem });
  } catch (error) {
    console.error('Error uploading image or marking item:', error);
    res.status(500).json({ error: 'Failed to upload image or mark item' });
  }
});

router.delete('/lobbies/:lobbyId/players/:userId/items/:itemId/deleteImage', async (req, res) => {
  const { lobbyId, userId, itemId } = req.params;

  try {
    const db = await connectDB();

    const playerItem = await db.get(
      `SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`,
      [lobbyId, userId, itemId]
    );

    const imagePath = path.join(__dirname, '..', playerItem.image)

    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting image file:', err);
        return res.status(500).json({ error: 'Failed to delete image file' });
      }
      if (!playerItem) {
        return res.status(404).json({ error: 'Player item not found' });
      }
    }); 

    //  Update the player's points in the lobbies table

    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
    let pointsArray = JSON.parse(lobby.points || '[]');
    const itemPoints = 10;

    for(const entry of pointsArray) {
      if (entry.id === userId) {
        entry.points -= itemPoints;
      }
    }

    await db.run(`UPDATE lobbies SET points = ? WHERE id = ?`, [JSON.stringify(pointsArray), lobbyId]);
    await db.run(`UPDATE player_items SET found = 0, image = '' WHERE lobby_id = ? AND player_id = ? AND item_id = ?`,
      [lobbyId, userId, itemId]
    );

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
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

      const gameTime = lobby.gameTime;

      if (gameTime === undefined || gameTime === null) {
          return res.status(500).json({ error: 'Invalid game time data' });
      }

      res.status(200).json({ gameTime });
  } catch (error) {
      console.error('Error retrieving gameTime:', error);
      res.status(500).json({ error: 'Failed to retrieve gameTime' });
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

    await db.run(`UPDATE lobbies SET status = ? WHERE id = ?`, ['started', lobbyId]);

    res.status(200).json({ message: `Lobby ${lobbyId} started` });
  } catch (error) {
    console.error('Error starting lobby:', error);
    res.status(500).json({ error: 'Failed to start lobby' });
  }
});

router.post('/lobbies/:lobbyId/end', async (req, res) => {
  const { lobbyId } = req.params;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    await db.run(`UPDATE lobbies SET status = ? WHERE id = ?`, ['ended', lobbyId]);

    res.status(200).json({ message: `Lobby ${lobbyId} ended successfully` });
  } catch (error) {
    console.error('Error ending lobby:', error);
    res.status(500).json({ error: 'Failed to end the lobby' });
  }
});

router.get('/lobbies/:lobbyId/score', async (req, res) => {
  const { lobbyId } = req.params;

  try {
    const db = await connectDB();
    const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    let pointsArray = JSON.parse(lobby.points || '[]');

    if (!Array.isArray(pointsArray)) {
      return res.status(500).json({ error: 'Invalid points data' });
    }

    res.status(200).json({ players: pointsArray });
  } catch (error) {
    console.error('Error retrieving lobby score:', error);
    res.status(500).json({ error: 'Failed to retrieve lobby score' });
  }
});

router.get('/lobbies/submissions', async (req, res) => {
  try {
    const db = await connectDB();
 
    const submissions = await db.all(`
      SELECT pi.player_id AS userId, pi.item_id AS itemId, pi.lobby_id AS lobbyId, pi.image, l.lobbyName
      FROM player_items pi
      JOIN lobbies l ON l.id = pi.lobby_id
      WHERE pi.found = 1 AND (pi.approved IS NULL OR pi.approved = 0)
    `);
    res.status(200).json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to retrieve submissions' });
  }
});

router.post('/lobbies/approveSubmission', async (req, res) => {
  const { lobbyId, userId, itemId, points, approved } = req.body;

  try {
    const db = await connectDB();

    // Update the `approved` column in the player_items table
    await db.run(
      `UPDATE player_items SET approved = ? WHERE lobby_id = ? AND player_id = ? AND item_id = ?`,
      [approved ? 1 : -1, lobbyId, userId, itemId]  
    );

    if (approved) {
      // If approved, add points
      const lobby = await db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
      if (lobby) {
        let pointsArray = JSON.parse(lobby.points || '[]');
        const playerIndex = pointsArray.findIndex((p: { id: string }) => p.id === userId);
        if (playerIndex !== -1) {
          pointsArray[playerIndex].points += points;
          await db.run(`UPDATE lobbies SET points = ? WHERE id = ?`, [JSON.stringify(pointsArray), lobbyId]);
        }
      }
    }

    res.status(200).json({ message: 'Submission processed successfully' });
  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

router.get('/lobbies/:lobbyId/players/:userId/items/:itemId/status', async (req, res) => {
  const { lobbyId, userId, itemId } = req.params;

  try {
    const db = await connectDB();

    const playerItem = await db.get(
      `SELECT approved FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`,
      [lobbyId, userId, itemId]
    );

    if (!playerItem) {
      return res.status(404).json({ error: 'Player item not found' });
    }

    res.status(200).json({ approved: playerItem.approved });
  } catch (error) {
    console.error('Error retrieving approval status:', error);
    res.status(500).json({ error: 'Failed to retrieve approval status' });
  }
});

export default router;
