"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const db_table_1 = require("./db_table");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', routes_1.default);
// Add this line to serve static files from the uploads folder
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
(0, db_table_1.initDatabase)().then(() => {
    console.log('Database created');
}).catch((error) => {
    console.error('Error creating database:', error);
});
app.use(express_1.default.static(path_1.default.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../client/build', 'index.html'));
});
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
exports.default = app;
