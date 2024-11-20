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
    // Create lobbies table if not exists
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
    //Player scavenge item status 
    yield db.exec(`
    CREATE TABLE IF NOT EXISTS player_items (
      player_id TEXT NOT NULL,
      lobby_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      found BOOLEAN DEFAULT 0,
      image TEXT,
      PRIMARY KEY (player_id, lobby_id, item_id),
      FOREIGN KEY (lobby_id) REFERENCES lobbies(id)
    )
  `);
    console.log('Database initialized with lobbies and player_items tables.');
});
exports.initDatabase = initDatabase;
