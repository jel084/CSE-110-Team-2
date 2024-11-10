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
 return db;
};

export default initDB;