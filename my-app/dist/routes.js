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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lobbies_1 = require("./lobbies");
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
router.post('/create', lobbies_1.createLobby);
router.post('/join', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, pin } = req.body;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE pin = ?`, [pin]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found or PIN is incorrect' });
        }
        const players = JSON.parse(lobby.players || '[]');
        let pointsArray = JSON.parse(lobby.points || '[]');
        const lobbyId = JSON.parse(lobby.id);
        if (!Array.isArray(pointsArray)) {
            pointsArray = [];
        }
        if (!players.includes(userId)) {
            players.push(userId);
            pointsArray.push({ id: userId, points: 0 });
            yield db.run(`UPDATE lobbies SET players = ?, points = ? WHERE pin = ?`, [JSON.stringify(players), JSON.stringify(pointsArray), pin]);
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
router.post('/lobbies/:lobbyId/end', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        yield db.run(`UPDATE lobbies SET status = ? WHERE id = ?`, ['ended', lobbyId]);
        res.status(200).json({ message: `Lobby ${lobbyId} ended successfully` });
    }
    catch (error) {
        console.error('Error ending lobby:', error);
        res.status(500).json({ error: 'Failed to end the lobby' });
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
router.post('/lobbies/:lobbyId/:userId/leave', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        let players = JSON.parse(lobby.players || '[]');
        let pointsArray = JSON.parse(lobby.points || '[]');
        let itemsArray = JSON.parse(lobby.scavengerItems || '[]');
        players = players.filter((name) => name !== userId);
        itemsArray = itemsArray.filter((i) => i.name !== userId);
        pointsArray = pointsArray.filter((p) => p.id !== userId);
        yield db.run(`UPDATE lobbies SET players = ?, points = ?, scavengerItems = ? WHERE id = ?`, [JSON.stringify(players), JSON.stringify(pointsArray), JSON.stringify(itemsArray), lobbyId]);
        // Remove player's items from player_items
        yield db.run(`DELETE FROM player_items WHERE player_id = ? AND lobby_id = ?`, [userId, lobbyId]);
        res.status(200).json({ message: `User ${userId} left lobby ${lobbyId}`, players });
    }
    catch (error) {
        console.error('Error leaving lobby:', error);
        res.status(500).json({ error: 'Failed to leave lobby' });
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
        if (!Array.isArray(scavengerItems) || scavengerItems.length === 0) {
            return res.status(200).json({ items: [] });
        }
        const playerItems = yield db.all(`SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ?`, [lobbyId, userId]);
        const playerItemsMap = playerItems.reduce((map, item) => {
            map[item.item_id] = item;
            return map;
        }, {});
        scavengerItems = scavengerItems.map((item) => {
            var _a, _b, _c, _d;
            return (Object.assign(Object.assign({}, item), { found: (_b = (_a = playerItemsMap[item.id]) === null || _a === void 0 ? void 0 : _a.found) !== null && _b !== void 0 ? _b : item.found, image: (_d = (_c = playerItemsMap[item.id]) === null || _c === void 0 ? void 0 : _c.image) !== null && _d !== void 0 ? _d : item.image }));
        });
        res.status(200).json(scavengerItems);
    }
    catch (error) {
        console.error('Error retrieving items:', error);
        res.status(500).json({ error: 'Failed to retrieve items' });
    }
}));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage: storage });
// mark item as found
router.put('/lobbies/:lobbyId/players/:userId/items/:itemId/upload', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId, itemId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const playerItem = yield db.get(`SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`, [lobbyId, userId, itemId]);
        if (!playerItem) {
            return res.status(404).json({ error: 'Player item not found' });
        }
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        yield db.run(`UPDATE player_items SET found = ?, image = ? WHERE lobby_id = ? AND player_id = ? AND item_id = ?`, [true, imageUrl, lobbyId, userId, itemId]);
        const updatedPlayerItem = yield db.get(`SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`, [lobbyId, userId, itemId]);
        res.status(200).json({ message: 'Item marked successfully and image uploaded', item: updatedPlayerItem });
    }
    catch (error) {
        console.error('Error uploading image or marking item:', error);
        res.status(500).json({ error: 'Failed to upload image or mark item' });
    }
}));
router.delete('/lobbies/:lobbyId/players/:userId/items/:itemId/deleteImage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId, itemId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const playerItem = yield db.get(`SELECT * FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`, [lobbyId, userId, itemId]);
        const imagePath = path_1.default.join(__dirname, '..', playerItem.image);
        fs_1.default.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting image file:', err);
                return res.status(500).json({ error: 'Failed to delete image file' });
            }
            if (!playerItem) {
                return res.status(404).json({ error: 'Player item not found' });
            }
        });
        //  Update the player's points in the lobbies table
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        let pointsArray = JSON.parse(lobby.points || '[]');
        const itemPoints = 10;
        for (const entry of pointsArray) {
            if (entry.id === userId) {
                entry.points -= itemPoints;
            }
        }
        yield db.run(`UPDATE lobbies SET points = ? WHERE id = ?`, [JSON.stringify(pointsArray), lobbyId]);
        yield db.run(`UPDATE player_items SET found = 0, image = '' WHERE lobby_id = ? AND player_id = ? AND item_id = ?`, [lobbyId, userId, itemId]);
        res.status(200).json({ message: 'Image deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
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
router.get('/lobbies/:lobbyId/gameTime', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        const gameTime = lobby.gameTime;
        if (gameTime === undefined || gameTime === null) {
            return res.status(500).json({ error: 'Invalid game time data' });
        }
        res.status(200).json({ gameTime });
    }
    catch (error) {
        console.error('Error retrieving gameTime:', error);
        res.status(500).json({ error: 'Failed to retrieve gameTime' });
    }
}));
router.post('/lobbies/:lobbyId/:timeRemaining/setTime', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, timeRemaining } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        yield db.run(`UPDATE lobbies SET gameTime = ? WHERE id = ?`, [timeRemaining, lobbyId]);
        res.status(200).json({ message: 'Game time updated successfully' });
    }
    catch (error) {
        console.error('Error updating gameTime:', error);
        res.status(500).json({ error: 'Failed to update gameTime' });
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
        yield db.run(`UPDATE lobbies SET status = ? WHERE id = ?`, ['started', lobbyId]);
        res.status(200).json({ message: `Lobby ${lobbyId} started` });
    }
    catch (error) {
        console.error('Error starting lobby:', error);
        res.status(500).json({ error: 'Failed to start lobby' });
    }
}));
router.post('/lobbies/:lobbyId/end', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        yield db.run(`UPDATE lobbies SET status = ? WHERE id = ?`, ['ended', lobbyId]);
        res.status(200).json({ message: `Lobby ${lobbyId} ended successfully` });
    }
    catch (error) {
        console.error('Error ending lobby:', error);
        res.status(500).json({ error: 'Failed to end the lobby' });
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
router.get('/lobbies/submissions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.connectDB)();
        const submissions = yield db.all(`
      SELECT pi.player_id AS userId, pi.item_id AS itemId, pi.lobby_id AS lobbyId, pi.image, l.lobbyName
      FROM player_items pi
      JOIN lobbies l ON l.id = pi.lobby_id
      WHERE pi.found = 1 AND (pi.approved IS NULL OR pi.approved = 0)
    `);
        res.status(200).json({ submissions });
    }
    catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to retrieve submissions' });
    }
}));
router.post('/lobbies/approveSubmission', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId, itemId, points, approved } = req.body;
    try {
        const db = yield (0, db_1.connectDB)();
        // Update the `approved` column in the player_items table
        yield db.run(`UPDATE player_items SET approved = ? WHERE lobby_id = ? AND player_id = ? AND item_id = ?`, [approved ? 1 : -1, lobbyId, userId, itemId]);
        if (approved) {
            // If approved, add points
            const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
            if (lobby) {
                let pointsArray = JSON.parse(lobby.points || '[]');
                const playerIndex = pointsArray.findIndex((p) => p.id === userId);
                if (playerIndex !== -1) {
                    pointsArray[playerIndex].points += points;
                    yield db.run(`UPDATE lobbies SET points = ? WHERE id = ?`, [JSON.stringify(pointsArray), lobbyId]);
                }
            }
        }
        res.status(200).json({ message: 'Submission processed successfully' });
    }
    catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).json({ error: 'Failed to process submission' });
    }
}));
router.get('/lobbies/:lobbyId/players/:userId/items/:itemId/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId, itemId } = req.params;
    try {
        const db = yield (0, db_1.connectDB)();
        const playerItem = yield db.get(`SELECT approved FROM player_items WHERE lobby_id = ? AND player_id = ? AND item_id = ?`, [lobbyId, userId, itemId]);
        if (!playerItem) {
            return res.status(404).json({ error: 'Player item not found' });
        }
        res.status(200).json({ approved: playerItem.approved });
    }
    catch (error) {
        console.error('Error retrieving approval status:', error);
        res.status(500).json({ error: 'Failed to retrieve approval status' });
    }
}));
exports.default = router;
