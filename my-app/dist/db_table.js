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
exports.initDatabase = void 0;
const db_1 = require("./db");
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, db_1.connectDB)();
    // Create the lobbies table if it doesn't exist
    yield db.exec(`
    CREATE TABLE IF NOT EXISTS lobbies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lobbyName TEXT NOT NULL,
      host TEXT NOT NULL,
      players TEXT,
      scavengerItems TEXT,
      points TEXT,
      pin TEXT NOT NULL,
      status TEXT DEFAULT 'waiting'
    )
  `);
    console.log('Database initialized with lobbies table.');
});
exports.initDatabase = initDatabase;
