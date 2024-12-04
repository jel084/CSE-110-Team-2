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
const axios_1 = __importDefault(require("axios"));
const server_1 = __importDefault(require("../server"));
const db_1 = require("../db");
const db_table_1 = require("../db_table");
let server;
let db;
const fs = require('fs');
const FormData = require('form-data');
const PORT = process.env.PORT || 8080;
const originalConsoleLog = console.log;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Suppress message that appears every time database is initialized
    console.log = (...args) => {
        if (!args.includes('Database initialized with lobbies and player_items tables.')) {
            originalConsoleLog.apply(console, args);
        }
    };
    db = yield (0, db_1.connectDB)();
    server = yield server_1.default.listen(PORT); // Start the server before tests
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log = originalConsoleLog;
    fs.unlinkSync('server/database.sqlite'); // Automatically delete database.sqlite after all tests are done
    server.close(); // Stop the server after tests
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_table_1.initDatabase)();
}));
describe('/lobbies tests', () => {
    test('GET /lobbies should show all lobbies', () => __awaiter(void 0, void 0, void 0, function* () {
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '[]', '[]', '[]', '1234', 21, 'waiting'),
      ('New Lobby 2', 'Host 2', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]', 
      '[{"id":"Player 1","points":0}]', '5678', 22, 'in-progress')
    `);
        // Perform the GET request to the /lobbies endpoint
        const res = yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies`);
        expect(res.status).toBe(200);
        expect(res.data).toHaveLength(2);
        expect(res.data[0]).toMatchObject({
            lobbyName: 'New Lobby 1',
            host: 'Host 1',
            players: '[]',
            scavengerItems: '[]',
            points: '[]',
            pin: '1234',
            gameTime: 21,
            status: 'waiting',
        });
        expect(res.data[1]).toMatchObject({
            lobbyName: 'New Lobby 2',
            host: 'Host 2',
            players: '["Player 1"]',
            scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
            points: '[{"id":"Player 1","points":0}]',
            pin: '5678',
            gameTime: 22,
            status: 'in-progress',
        });
    }));
    test('GET /lobbies with no lobbies table should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield db.run(`DROP TABLE lobbies`);
        try {
            yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(500);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Failed to retrieve lobbies',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/create tests', () => {
    test('POST /create should add a new lobby to lobbies', () => __awaiter(void 0, void 0, void 0, function* () {
        // Perform the POST request to the /create endpoint
        const res = yield axios_1.default.post(`http://localhost:${PORT}/api/create`, {
            lobbyName: 'New Lobby 1',
            scavengerItems: [{ id: 1, name: "Triton Statue", points: 10, found: false }, { id: 2, name: "Sun God", points: 10, found: false }],
            userId: 'Host 1',
            pin: '1234',
            gameTime: 50
        });
        expect(res.status).toBe(201);
        expect(res.data.lobbyId).toBe(1);
        // Ensure the lobbies table is updated
        const lobbies = yield db.all(`SELECT * FROM lobbies`);
        expect(lobbies).toHaveLength(1);
        expect(lobbies[0]).toMatchObject({
            lobbyName: 'New Lobby 1',
            host: 'Host 1',
            players: '[]',
            scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
            points: '[]',
            pin: '1234',
            gameTime: 50,
            status: 'waiting'
        });
    }));
    test('POST /create with missing fields should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            yield axios_1.default.post(`http://localhost:${PORT}/api/create`, {
                lobbyName: 'New Lobby 1',
                scavengerItems: [{ id: 1, name: "Triton Statue", points: 10 }],
                pin: '1234',
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(500);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Failed to create lobby',
                });
            }
            else {
                throw error;
            }
        }
    }));
    test('POST /create with invalid scavengerItems should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        try {
            yield axios_1.default.post(`http://localhost:${PORT}/api/create`, {
                lobbyName: 'New Lobby',
                scavengerItems: "invalid data",
                userId: 'Host 1',
                pin: '1234',
                gameTime: 50
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_c = error.response) === null || _c === void 0 ? void 0 : _c.status).toBe(500);
                expect((_d = error.response) === null || _d === void 0 ? void 0 : _d.data).toMatchObject({
                    error: 'Failed to create lobby',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/join tests', () => {
    test('POST /join should add a player to the given lobby', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a lobby for the player to join
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '[]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]', 
      '[]', '1234', 60, 'waiting')
    `);
        // Perform the POST request to the /join endpoint
        const res = yield axios_1.default.post(`http://localhost:${PORT}/api/join`, {
            lobbyId: 1,
            userId: 'Player 1',
            pin: '1234'
        });
        expect(res.status).toBe(200);
        expect(res.data.message).toBe("User Player 1 joined lobby 1");
        // Ensure the lobbies table is updated
        const lobbies = yield db.all(`SELECT * FROM lobbies`);
        expect(lobbies).toHaveLength(1);
        expect(lobbies[0]).toMatchObject({
            lobbyName: 'New Lobby 1',
            host: 'Host 1',
            players: '["Player 1"]',
            scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
            points: '[{"id":"Player 1","points":0}]',
            pin: '1234',
            gameTime: 60,
            status: 'waiting'
        });
        // Ensure the player_items table is updated
        const player_items = yield db.all(`SELECT * FROM player_items`);
        expect(player_items).toHaveLength(2);
        expect(player_items[0]).toMatchObject({
            player_id: 'Player 1',
            lobby_id: 1,
            item_id: 1,
            found: 0,
            image: ''
        });
        expect(player_items[1]).toMatchObject({
            player_id: 'Player 1',
            lobby_id: 1,
            item_id: 2,
            found: 0,
            image: ''
        });
    }));
    test('POST /join with incorrect PIN should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            yield axios_1.default.post(`http://localhost:${PORT}/api/join`, {
                lobbyId: 1,
                userId: 'Player 1',
                pin: '1234',
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(404);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Lobby not found or PIN is incorrect',
                });
            }
            else {
                throw error;
            }
        }
    }));
    test('POST /join with player already in the lobby should not create new entry', () => __awaiter(void 0, void 0, void 0, function* () {
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]', 
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        yield db.run(`
      INSERT INTO player_items VALUES
      ('Player 1', 1, 1, 0, ''), ('Player 1', 1, 2, 0, '')
    `);
        const res = yield axios_1.default.post(`http://localhost:${PORT}/api/join`, {
            lobbyId: 1,
            userId: 'Player 1',
            pin: '1234',
        });
        expect(res.status).toBe(200);
        expect(res.data.message).toBe("User Player 1 joined lobby 1");
        // Ensure the lobbies table is the same
        const lobbies = yield db.all(`SELECT * FROM lobbies`);
        expect(lobbies).toHaveLength(1);
        expect(lobbies[0]).toMatchObject({
            lobbyName: 'New Lobby 1',
            host: 'Host 1',
            players: '["Player 1"]',
            scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
            points: '[{"id":"Player 1","points":0}]',
            pin: '1234',
            gameTime: 60,
            status: 'waiting'
        });
        // Ensure the player_items table is updated
        const player_items = yield db.all(`SELECT * FROM player_items`);
        expect(player_items).toHaveLength(2);
        expect(player_items[0]).toMatchObject({
            player_id: 'Player 1',
            lobby_id: 1,
            item_id: 1,
            found: 0,
            image: ''
        });
        expect(player_items[1]).toMatchObject({
            player_id: 'Player 1',
            lobby_id: 1,
            item_id: 2,
            found: 0,
            image: ''
        });
    }));
});
describe('/update-points tests', () => {
    test('POST /update-points should update points for the given player', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a lobby with players
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        // Perform the POST request to the /update-points endpoint
        const res = yield axios_1.default.post(`http://localhost:${PORT}/api/update-points`, {
            lobbyId: 1,
            userId: 'Player 1',
            points: 10,
        });
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ message: 'Points updated successfully' });
        // Ensure the lobbies table is updated
        const lobbies = yield db.all(`SELECT * FROM lobbies`);
        expect(lobbies).toHaveLength(1);
        expect(lobbies[0]).toMatchObject({
            lobbyName: 'New Lobby 1',
            host: 'Host 1',
            players: '["Player 1"]',
            scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
            points: '[{"id":"Player 1","points":10}]',
            pin: '1234',
            gameTime: 60,
            status: 'waiting'
        });
    }));
    test('POST /update-points with invalid lobby id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.post(`http://localhost:${PORT}/api/update-points`, {
                lobbyId: 2,
                userId: 'Player 1',
                points: 10,
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(404);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Lobby not found',
                });
            }
            else {
                throw error;
            }
        }
    }));
    test('POST /update-points with invalid user id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.post(`http://localhost:${PORT}/api/update-points`, {
                lobbyId: 1,
                userId: 'Player 2',
                points: 10,
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_c = error.response) === null || _c === void 0 ? void 0 : _c.status).toBe(404);
                expect((_d = error.response) === null || _d === void 0 ? void 0 : _d.data).toMatchObject({
                    error: 'User not found in lobby',
                });
            }
            else {
                throw error;
            }
        }
    }));
    test('POST /update-points with invalid points should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _e, _f;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.post(`http://localhost:${PORT}/api/update-points`, {
                lobbyId: 1,
                userId: 'Player 1',
                points: 'invalid data',
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_e = error.response) === null || _e === void 0 ? void 0 : _e.status).toBe(500);
                expect((_f = error.response) === null || _f === void 0 ? void 0 : _f.data).toMatchObject({
                    error: 'Failed to update points',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/items tests', () => {
    test('GET /items should return items of the player from the given lobby', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a lobby with items
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1", "Player 2"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      '[{"id":"Player 1","points":0},{"id":"Player 2","points":10}]', '1234', 60, 'waiting')
    `);
        yield db.run(`
      INSERT INTO player_items VALUES
      ('Player 1', 1, 1, 0, ''), ('Player 1', 1, 2, 0, ''),
      ('Player 2', 1, 1, 0, ''), ('Player 2', 1, 2, 1, 'test.jpg')
    `);
        // Perform the GET request to the appropriate /items endpoint
        const res = yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/1/players/Player 2/items`);
        expect(res.status).toBe(200);
        expect(res.data).toHaveLength(2);
        expect(res.data).toMatchObject([
            { id: 1, name: "Triton Statue", points: 10, found: 0, image: '' },
            { id: 2, name: "Sun God", points: 10, found: 1, image: 'test.jpg' }
        ]);
    }));
    test('GET /items with empty scavengerItems should return empty array', () => __awaiter(void 0, void 0, void 0, function* () {
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby', 'Host 1', '[]', '[]', '[]', '1234', 60, 'waiting')
    `);
        const res = yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/1/players/Host 1/items`);
        expect(res.status).toBe(200);
        expect(res.data.items).toHaveLength(0);
    }));
    test('GET /items with invalid lobby id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '[]', '[{"id":1,"name":"Triton Statue","points":10,"found":false},{"id":2,"name":"Sun God","points":10,"found":false}]',
      '[]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/2/players/Host 1/items`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(404);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Lobby not found',
                });
            }
            else {
                throw error;
            }
        }
    }));
    test('GET /items with invalid scavengerItems should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby', 'Host 1', '[]', 'invalid data', '[]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/1/players/Host 1/items`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_c = error.response) === null || _c === void 0 ? void 0 : _c.status).toBe(500);
                expect((_d = error.response) === null || _d === void 0 ? void 0 : _d.data).toMatchObject({
                    error: 'Failed to retrieve items',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/upload tests', () => {
    test('PUT /upload should mark the given item for the given player', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a lobby for a player to upload an image
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        yield db.run(`
      INSERT INTO player_items VALUES
      ('Player 1', 1, 1, 0, '')
    `);
        // Read the contents of /uploads to get all images before new image is added
        const uploads = yield fs.promises.readdir('uploads');
        // Perform the PUT request to the appropriate /upload endpoint
        const formData = new FormData();
        formData.append('image', fs.createReadStream('client/public/bg_img.jpg'));
        formData.append('lobbyId', '1');
        formData.append('userId', 'Player 1');
        formData.append('itemId', '1');
        const res = yield axios_1.default.put(`http://localhost:8080/api/lobbies/1/players/Player 1/items/1/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty('item');
        // Get name of new upload and verify the image field is updated
        const newUploads = yield fs.promises.readdir('uploads');
        const addedFiles = newUploads.filter((upload) => !uploads.includes(upload));
        expect(res.data.item).toMatchObject({
            player_id: 'Player 1',
            lobby_id: 1,
            item_id: 1,
            found: 1,
            image: `/uploads/${addedFiles[0]}`
        });
        fs.unlinkSync(`uploads/${addedFiles[0]}`);
    }));
    test('PUT /upload with invalid item id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        yield db.run(`
      INSERT INTO player_items (player_id, lobby_id, item_id, found, image) VALUES
      ('Player 1', 1, 1, false, '')
    `);
        try {
            yield axios_1.default.put(`http://localhost:${PORT}/api/lobbies/1/players/Player 1/items/2/upload`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(404);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Player item not found',
                });
            }
            else {
                throw error;
            }
        }
    }));
    test('PUT /upload with no image should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        yield db.run(`
      INSERT INTO player_items (player_id, lobby_id, item_id, found, image) VALUES
      ('Player 1', 1, 1, false, '')
    `);
        try {
            yield axios_1.default.put(`http://localhost:${PORT}/api/lobbies/1/players/Player 1/items/1/upload`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_c = error.response) === null || _c === void 0 ? void 0 : _c.status).toBe(500);
                expect((_d = error.response) === null || _d === void 0 ? void 0 : _d.data).toMatchObject({
                    error: 'Failed to upload image or mark item',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/deleteImage tests', () => {
    test('DELETE /deleteImage should delete the image from uploads', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a lobby for a player to delete an image
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":10}]', '1234', 60, 'waiting')
    `);
        yield db.run(`
      INSERT INTO player_items VALUES
      ('Player 1', 1, 1, 1, 'uploads/test.jpg')
    `);
        // Copy an image to the uploads file
        fs.copyFile('client/public/bg_img.jpg', 'uploads/test.jpg', (err) => {
            if (err) {
                console.error('Error copying the image:', err);
            }
            else {
                console.log('Image copied successfully to', 'uploads/test.jpg');
            }
        });
        // Perform the DELETE request to the appropriate /deleteImage endpoint
        const res = yield axios_1.default.delete(`http://localhost:8080/api/lobbies/1/players/Player 1/items/1/deleteImage`);
        expect(res.status).toBe(200);
        expect(res.data.message).toBe('Image deleted successfully');
        // Get uploads and verify the image is deleted
        const uploads = yield fs.promises.readdir('uploads');
        expect(uploads.includes('test.jpg')).toBe(false);
        // Ensure the player_items table is updated
        const player_items = yield db.all('SELECT * FROM player_items');
        expect(player_items[0]).toMatchObject({
            player_id: 'Player 1',
            lobby_id: 1,
            item_id: 1,
            found: 0,
            image: ''
        });
    }));
    test('PUT /deleteImage with invalid lobby id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        yield db.run(`
      INSERT INTO player_items (player_id, lobby_id, item_id, found, image) VALUES
      ('Player 1', 1, 1, false, '')
    `);
        try {
            yield axios_1.default.delete(`http://localhost:${PORT}/api/lobbies/2/players/Player 1/items/1/deleteImage`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(500);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Failed to delete image',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/players tests', () => {
    test('GET /players should return players of the given lobby', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a lobby with players
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1", "Player 2"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0},{"id":"Player 2","points":0}]', '1234', 60, 'waiting')
    `);
        // Perform the GET request to the appropriate /players endpoint
        const res = yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/1/players`);
        expect(res.status).toBe(200);
        expect(res.data.players).toHaveLength(2);
        expect(res.data.players).toMatchObject(["Player 1", "Player 2"]);
    }));
    test('GET /players with invalid lobby id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/2/players`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(404);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Lobby not found',
                });
            }
            else {
                throw error;
            }
        }
    }));
    test('GET /players with invalid players should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby', 'Host 1', 'invalid data', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]', 
      '[]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/1/players`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_c = error.response) === null || _c === void 0 ? void 0 : _c.status).toBe(500);
                expect((_d = error.response) === null || _d === void 0 ? void 0 : _d.data).toMatchObject({
                    error: 'Failed to retrieve players',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/gameTime tests', () => {
    test('GET /gameTime should return the time remaining for the given lobby', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a lobby with a time set
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        // Perform the GET request to the appropriate /players endpoint
        const res = yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/1/gameTime`);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ gameTime: 60 });
    }));
    test('GET /gameTime with invalid lobby id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/2/gameTime`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(404);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Lobby not found',
                });
            }
            else {
                throw error;
            }
        }
    }));
    test('GET /gameTime with invalid game time should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby', 'Host 1', '[]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]', 
      '[]', '1234', 'invalid data', 'waiting')
    `);
        try {
            yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/1/gameTime`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_c = error.response) === null || _c === void 0 ? void 0 : _c.status).toBe(500);
                expect((_d = error.response) === null || _d === void 0 ? void 0 : _d.data).toMatchObject({
                    error: 'Failed to retrieve gameTime',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/setTime tests', () => {
    test('POST /setTime should update the time remaining for the given lobby', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a lobby with time set
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        // Perform the POST request to the appropriate /setTime endpoint
        const res = yield axios_1.default.post(`http://localhost:${PORT}/api/lobbies/1/59/setTime`);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ message: 'Game time updated successfully' });
        // Ensure the lobbies table is updated
        const lobbies = yield db.all(`SELECT * FROM lobbies`);
        expect(lobbies).toHaveLength(1);
        expect(lobbies[0]).toMatchObject({
            lobbyName: 'New Lobby 1',
            host: 'Host 1',
            players: '["Player 1"]',
            scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
            points: '[{"id":"Player 1","points":0}]',
            pin: '1234',
            gameTime: 59,
            status: 'waiting'
        });
    }));
    test('POST /setTime with invalid lobby id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.post(`http://localhost:${PORT}/api/lobbies/2/59/setTime`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(404);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Lobby not found',
                });
            }
            else {
                throw error;
            }
        }
    }));
    test('POST /setTime with invalid time should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.post(`http://localhost:${PORT}/api/lobbies/1/invalid data/setTime`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_c = error.response) === null || _c === void 0 ? void 0 : _c.status).toBe(500);
                expect((_d = error.response) === null || _d === void 0 ? void 0 : _d.data).toMatchObject({
                    error: 'Failed to update gameTime',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/start tests', () => {
    test('POST /start should change lobby status to started', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a lobby that will be started
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'waiting')
    `);
        // Perform the POST request to the appropriate /start endpoint
        const res = yield axios_1.default.post(`http://localhost:${PORT}/api/lobbies/1/start`);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ message: `Lobby 1 started` });
        // Ensure the lobby in lobbies table has its status updated
        const lobbies = yield db.all(`SELECT * FROM lobbies`);
        expect(lobbies).toHaveLength(1);
        expect(lobbies[0]).toMatchObject({
            lobbyName: 'New Lobby 1',
            host: 'Host 1',
            players: '["Player 1"]',
            scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
            points: '[{"id":"Player 1","points":0}]',
            pin: '1234',
            gameTime: 60,
            status: 'started'
        });
    }));
    test('POST /start with invalid lobby id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '[]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[]', '1234', 60, 'waiting')
    `);
        try {
            yield axios_1.default.post(`http://localhost:${PORT}/api/lobbies/2/start`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(404);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Lobby not found',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/end tests', () => {
    test('POST /end should change lobby status to started', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a lobby that will be ended
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":0}]', '1234', 60, 'started')
    `);
        // Perform the POST request to the appropriate /end endpoint
        const res = yield axios_1.default.post(`http://localhost:${PORT}/api/lobbies/1/end`);
        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({ message: `Lobby 1 ended successfully` });
        // Ensure the lobby in lobbies table has its status updated
        const lobbies = yield db.all(`SELECT * FROM lobbies`);
        expect(lobbies).toHaveLength(1);
        expect(lobbies[0]).toMatchObject({
            lobbyName: 'New Lobby 1',
            host: 'Host 1',
            players: '["Player 1"]',
            scavengerItems: '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
            points: '[{"id":"Player 1","points":0}]',
            pin: '1234',
            gameTime: 60,
            status: 'ended'
        });
    }));
    test('POST /end with invalid lobby id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '[]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[]', '1234', 60, 'started')
    `);
        try {
            yield axios_1.default.post(`http://localhost:${PORT}/api/lobbies/2/end`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(404);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Lobby not found',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
describe('/score tests', () => {
    test('GET /score should return the scores of the given lobby', () => __awaiter(void 0, void 0, void 0, function* () {
        // Insert a lobby with points
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      '[{"id":"Player 1","points":10}]', '1234', 60, 'started')
    `);
        // Perform the GET request to the appropriate /scores endpoint
        const res = yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/1/score`);
        expect(res.status).toBe(200);
        expect(res.data.players).toMatchObject([
            { id: 'Player 1', points: 10 }
        ]);
    }));
    test('GET /score with invalid lobby id should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/2/score`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(404);
                expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toMatchObject({
                    error: 'Lobby not found',
                });
            }
            else {
                throw error;
            }
        }
    }));
    test('GET /score with invalid points should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        yield db.run(`
      INSERT INTO lobbies (lobbyName, host, players, scavengerItems, points, pin, gameTime, status) VALUES
      ('New Lobby 1', 'Host 1', '["Player 1"]', '[{"id":1,"name":"Triton Statue","points":10,"found":false}]',
      'invalid data', '1234', 60, 'started')
    `);
        try {
            yield axios_1.default.get(`http://localhost:${PORT}/api/lobbies/1/score`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                expect((_c = error.response) === null || _c === void 0 ? void 0 : _c.status).toBe(500);
                expect((_d = error.response) === null || _d === void 0 ? void 0 : _d.data).toMatchObject({
                    error: 'Failed to retrieve lobby score',
                });
            }
            else {
                throw error;
            }
        }
    }));
});
