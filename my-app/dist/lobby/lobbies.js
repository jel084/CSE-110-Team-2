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
const parseJsonField = (field) => {
    return field ? JSON.parse(field) : [];
};
const createLobby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyName, scavengerItems, userId, pin } = req.body;
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
            pin
        ]);
        res.status(201).json({ lobbyId: result.lastID });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create lobby' });
    }
});
exports.createLobby = createLobby;
const joinLobby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyId, userId, pin } = req.body;
    try {
        const db = yield (0, db_1.connectDB)();
        const lobby = yield db.get(`SELECT * FROM lobbies WHERE id = ?`, [lobbyId]);
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby does not exist' });
        }
        if (lobby.pin !== pin) {
            return res.status(403).json({ error: 'Incorrect PIN' });
        }
        const players = JSON.parse(lobby.players || '[]');
        let pointsArray = JSON.parse(lobby.points || '[]');
        // Check if user is already in the lobby
        if (!players.includes(userId)) {
            players.push(userId);
            pointsArray.push({ id: userId, points: 0 }); // Add player with 0 points
            yield db.run(`
        UPDATE lobbies SET players = ?, points = ? WHERE id = ?
      `, [JSON.stringify(players), JSON.stringify(pointsArray), lobbyId]);
        }
        res.status(200).json({ message: 'Joined lobby successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to join lobby' });
    }
});
exports.joinLobby = joinLobby;
const getAllLobbies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.connectDB)();
        const lobbies = yield db.all(`SELECT * FROM lobbies`);
        const parsedLobbies = lobbies.map((lobby) => (Object.assign(Object.assign({}, lobby), { players: parseJsonField(lobby.players), scavengerItems: parseJsonField(lobby.scavengerItems), points: parseJsonField(lobby.points) })));
        res.status(200).json(parsedLobbies);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve lobbies' });
    }
});
exports.getAllLobbies = getAllLobbies;
