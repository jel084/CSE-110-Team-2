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
exports.joinLobby = exports.createLobby = void 0;
const db_1 = require("./db");
const createLobby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lobbyName, scavengerItems, userId, gameTime, pin } = req.body;
    if (!pin || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: 'A valid 4-digit PIN is required' });
    }
    try {
        const db = yield (0, db_1.connectDB)();
        // Ensure scavengerItems is an array of objects
        if (!Array.isArray(scavengerItems) || !scavengerItems.every(item => typeof item === 'object')) {
            return res.status(400).json({ error: 'Scavenger items must be an array of objects' });
        }
        const result = yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
            lobbyName,
            userId,
            JSON.stringify([]),
            JSON.stringify(scavengerItems),
            JSON.stringify([]),
            pin,
            gameTime
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
        if (!players.includes(userId)) {
            players.push(userId);
            pointsArray.push({ id: userId, points: 0 });
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
