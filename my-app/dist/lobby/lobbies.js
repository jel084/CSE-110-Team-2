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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLobbies = exports.joinLobby = exports.createLobby = void 0;
const db_1 = require("../db");
// Utility function to parse JSON from SQLite text fields
const parseJsonField = (field) => {
    return field ? JSON.parse(field) : [];
};
// Create Lobby
const createLobby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyName, scavengerItems, userId, pin } = req.body;
    // Validate that the pin is a 4-digit number
    if (!pin || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: 'A valid 4-digit PIN is required' });
    }
    try {
        const db = yield (0, db_1.connectDB)();
        const result = yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
            lobbyName,
            userId,
            JSON.stringify([]),
            JSON.stringify(scavengerItems),
            JSON.stringify({}),
            pin // Store the provided 4-digit PIN
        ]);
        res.status(201).json({ lobbyId: result.lastID });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create lobby' });
    }
});
exports.createLobby = createLobby;
// Join Lobby
const joinLobby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId, pin } = req.body;
    try {
        const db = yield (0, db_1.connectDB)();
        // Fetch lobby and validate existence
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby does not exist' });
        }
        // Check if the PIN matches
        if (lobby.pin !== pin) {
            return res.status(403).json({ error: 'Incorrect PIN' });
        }
        const players = parseJsonField(lobby.players);
        if (players.includes(userId) || userId === lobby.host) {
            return res.status(400).json({ error: 'User already in lobby or is the host' });
        }
        // Add the user to players and initialize their points
        players.push(userId);
        const points = parseJsonField(lobby.points);
        points[userId] = 0;
        yield db.run(`
      UPDATE lobbies SET players = ?, points = ? WHERE id = ?
    `, [JSON.stringify(players), JSON.stringify(points), lobbyId]);
        res.status(200).json({ message: 'Joined lobby successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to join lobby' });
    }
});
exports.joinLobby = joinLobby;
// Get All Lobbies
const getAllLobbies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.connectDB)();
        const lobbies = yield db.all(`SELECT * FROM lobbies`);
        // Parse JSON fields for players, scavengerItems, and points
        const parsedLobbies = lobbies.map((lobby) => (Object.assign(Object.assign({}, lobby), { players: parseJsonField(lobby.players), scavengerItems: parseJsonField(lobby.scavengerItems), points: parseJsonField(lobby.points) })));
        res.status(200).json(parsedLobbies);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve lobbies' });
    }
});
exports.getAllLobbies = getAllLobbies;
