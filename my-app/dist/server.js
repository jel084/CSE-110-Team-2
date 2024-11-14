"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const db_table_1 = require("./db_table"); // Adjust the path if needed
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize the database and create tables if they don't exist
(0, db_table_1.initDatabase)().then(() => {
    console.log('Database initialized successfully');
}).catch((error) => {
    console.error('Error initializing database:', error);
});
// Mount API routes under /api
app.use('/api', routes_1.default);
// Serve static files from the React app
app.use(express_1.default.static(path_1.default.join(__dirname, '../client/build')));
// Catch-all route to serve the React app for any route not handled by API
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../client/build', 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
