import sqlite3 from "sqlite3";
import { open } from "sqlite";

const initDB = async () => {
 // Open the database connection
 const db = await open({
   filename: "database.sqlite",
   driver: sqlite3.Database,
 });
 // Create a "players" table if it doesn't exist
 await db.exec(`
   CREATE TABLE IF NOT EXISTS players (
     name TEXT PRIMARY KEY,
     items TEXT NOT NULL,
     points INTEGER NOT NULL
   );
 `);

 // Test dataset
 await db.exec(`
   INSERT INTO players VALUES 
     ('playerA', 'items_playerA', 0),
     ('playerB', 'items_playerB', 0),
     ('playerC', 'items_playerC', 0);

   CREATE TABLE IF NOT EXISTS items_playerA (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     points INTEGER NOT NULL,
     found BOOLEAN NOT NULL,
     image TEXT
   );

   CREATE TABLE IF NOT EXISTS items_playerB (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     points INTEGER NOT NULL,
     found BOOLEAN NOT NULL,
     image TEXT
   );

   CREATE TABLE IF NOT EXISTS items_playerC (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     points INTEGER NOT NULL,
     found BOOLEAN NOT NULL,
     image TEXT
   );

   INSERT INTO items_playerA (name, points, found, image) VALUES
     ('item1', 20, 0, ''),
     ('item2', 20, 0, ''),
     ('item3', 20, 0, '');

   INSERT INTO items_playerB (name, points, found, image) VALUES
     ('item1', 20, 0, ''),
     ('item2', 20, 0, ''),
     ('item3', 20, 0, '');

   INSERT INTO items_playerC (name, points, found, image) VALUES
     ('item1', 20, 0, ''),
     ('item2', 20, 0, ''),
     ('item3', 20, 0, '');
  `);

 return db;
};

export default initDB;