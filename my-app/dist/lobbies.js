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
    const { lobbyName, scavengerItems, userId, userName, pin } = req.body;
    if (!pin || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: 'A valid 4-digit PIN is required' });
    }
    try {
        const db = yield (0, db_1.connectDB)();
        const pointsArray = [{}]; // Updated to include the player's name
        const result = yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
            lobbyName,
            JSON.stringify([]),
            JSON.stringify(scavengerItems),
            JSON.stringify(pointsArray),
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
    const { lobbyId, userId, userName, pin } = req.body; // Added userName
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
        // If the user is not in the lobby, add them
        if (!players.includes(userId)) {
            players.push(userId);
            // Add player to the points array including their name
            pointsArray.push({ id: userId, name: userName, points: 0 });
            // Update the database with the new players list and points array
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
