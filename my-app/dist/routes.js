"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
router.get('/lobbies', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.connectDB)();
        const lobbies = yield db.all('SELECT * FROM lobbies');
        res.json(lobbies);
    }
    catch (error) {
        console.error('Error retrieving lobbies:', error);
        res.status(500).json({ error: 'Failed to retrieve lobbies' });
    }
}));
router.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyName, scavengerItems, userId, pin } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'Host userId is required' });
    }
    try {
        const db = yield (0, db_1.connectDB)();
        // Insert the new lobby
        yield db.run(`INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            lobbyName,
            userId,
            JSON.stringify([userId]),
            JSON.stringify(scavengerItems),
            JSON.stringify([{ id: userId, points: 0 }]),
            pin,
            'waiting'
        ]);
        // Retrieve the newly created lobby to get its ID
        const newLobby = yield db.get(`SELECT * FROM lobbies WHERE host = ? ORDER BY id DESC LIMIT 1`, [userId]);
        const lobbyId = newLobby.id;
        // Add scavenger items for the host into the `player_items` table
        if (Array.isArray(scavengerItems) && scavengerItems.length > 0) {
            for (let item of scavengerItems) {
                yield db.run(`INSERT OR IGNORE INTO player_items (player_id, lobby_id, item_id, found, image)
          VALUES (?, ?, ?, ?, ?)`, [userId, lobbyId, item.id, false, '']);
            }
        }
        res.status(201).json({ message: `Lobby '${lobbyName}' created by ${userId}`, lobbyId });
    }
    catch (error) {
        console.error('Error creating lobby:', error);
        res.status(500).json({ error: 'Failed to create lobby' });
    }
}));
router.post('/join', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId, pin } = req.body;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ? AND pin = ?`, [lobbyId, pin]);
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
            yield db.run(`UPDATE lobbies SET players = ?, points = ? WHERE id = ?`, [JSON.stringify(players), JSON.stringify(pointsArray), lobbyId]);
            // Insert items for the player into player_items
            let scavengerItems = JSON.parse(lobby.scavengerItems || '[]');
            for (let item of scavengerItems) {
                yield db.run(`INSERT OR IGNORE INTO player_items (player_id, lobby_id, item_id, found, image)
          VALUES (?, ?, ?, ?, ?)`, [userId, lobbyId, item.id, false, '']);
            }
        }
        res.json({ message: `User ${userId} joined lobby ${lobbyId}`, lobbyId });
    }
    catch (error) {
        console.error('Error joining lobby:', error);
        res.status(500).json({ error: 'Failed to join lobby' });
    }
}));
router.post('/update-points', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId, points } = req.body;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        let pointsArray = JSON.parse(lobby.points || '[]');
        const player = pointsArray.find((p) => p.id === userId);
        if (!player) {
            return res.status(404).json({ error: 'User not found in lobby' });
        }
        player.points += points;
        yield db.run(`
      UPDATE lobbies SET points = ? WHERE id = ?
    `, [JSON.stringify(pointsArray), lobbyId]);
        res.status(200).json({ message: 'Points updated successfully' });
    }
    catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ error: 'Failed to update points' });
    }
}));
router.get('/lobbies/:lobbyId/players/:userId/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
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
    }
    catch (error) {
        console.error('Error retrieving items:', error);
        res.status(500).json({ error: 'Failed to retrieve items' });
    }
}));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure the "uploads" folder exists
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage: storage });
// Image upload and mark item as found
router.put('/lobbies/:lobbyId/players/:userId/items/:itemId/upload', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId, itemId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        // Step 1: Get the player's specific item to validate it exists
        const playerItem = yield db.get(`SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`, [lobbyId, userId, itemId]);
        if (!playerItem) {
            return res.status(404).json({ error: 'Player item not found' });
        }
        // Step 2: Update the item to mark it as found and add the image
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        yield db.run(`UPDATE player_items SET found = ?, image = ? WHERE lobby_id = ? AND player_id = ? AND item_id = ?`, [true, imageUrl, lobbyId, userId, itemId]);
        // Step 3: Update the player's points in the lobbies table
        // Retrieve lobby details to update points
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        // Parse the points array from the lobby record
        let pointsArray = JSON.parse(lobby.points || '[]');
        // Find the player in the points array
        const playerIndex = pointsArray.findIndex((p) => p.id === userId);
        if (playerIndex !== -1) {
            // Increment the points (you may want to use some point increment logic here, e.g., 10 points per item)
            pointsArray[playerIndex].points += 10; // Assuming each item is worth 10 points
        }
        // Step 4: Update the lobbies table with the new points array
        yield db.run(`UPDATE lobbies SET points = ? WHERE id = ?`, [JSON.stringify(pointsArray), lobbyId]);
        // Step 5: Return the updated player item as a response
        const updatedPlayerItem = yield db.get(`SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`, [lobbyId, userId, itemId]);
        res.status(200).json({ message: 'Item marked successfully and image uploaded', item: updatedPlayerItem });
    }
    catch (error) {
        console.error('Error uploading image or marking item:', error);
        res.status(500).json({ error: 'Failed to upload image or mark item' });
    }
}));
router.get('/lobbies/:lobbyId/players', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        const players = JSON.parse(lobby.players || '[]');
        // Ensure players is an array of strings
        if (!Array.isArray(players)) {
            return res.status(500).json({ error: 'Invalid players data' });
        }
        res.status(200).json({ players });
    }
    catch (error) {
        console.error('Error retrieving players:', error);
        res.status(500).json({ error: 'Failed to retrieve players' });
    }
}));
router.post('/lobbies/:lobbyId/start', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        // Update lobby status to started
        yield db.run(`UPDATE lobbies SET status = ? WHERE id = ?`, ['started', lobbyId]);
        res.status(200).json({ message: `Lobby ${lobbyId} started` });
    }
    catch (error) {
        console.error('Error starting lobby:', error);
        res.status(500).json({ error: 'Failed to start lobby' });
    }
}));
router.get('/lobbies/:lobbyId/score', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        let pointsArray = JSON.parse(lobby.points || '[]');
        // Validate that pointsArray is properly formatted
        if (!Array.isArray(pointsArray)) {
            return res.status(500).json({ error: 'Invalid points data' });
        }
        res.status(200).json({ players: pointsArray });
    }
    catch (error) {
        console.error('Error retrieving lobby score:', error);
        res.status(500).json({ error: 'Failed to retrieve lobby score' });
    }
}));
exports.default = router;
