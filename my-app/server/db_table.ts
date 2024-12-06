import { connectDB } from './db';

export const initDatabase = async () => {
  const db = await connectDB();

  await db.exec(`
    DROP TABLE IF EXISTS lobbies;
    DROP TABLE IF EXISTS player_items;
  `);

  // Create lobbies table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS lobbies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lobbyName TEXT NOT NULL,
      host TEXT NOT NULL,
      players TEXT,
      scavengerItems TEXT,
      points TEXT,
      pin TEXT NOT NULL,
      status TEXT DEFAULT 'waiting',
      gameTime INTEGER NOT NULL
    )
  `);

  //Player scavenge item status 
  await db.exec(`
    CREATE TABLE IF NOT EXISTS player_items (
      player_id TEXT NOT NULL,
      lobby_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      found BOOLEAN DEFAULT 0,
      image TEXT,
      approved BOOLEAN DEFAULT 0,
      PRIMARY KEY (player_id, lobby_id, item_id),
      FOREIGN KEY (lobby_id) REFERENCES lobbies(id)
    )
  `);

  //Results Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lobby_id INTEGER NOT NULL,
      player_id TEXT NOT NULL,
      points INTEGER NOT NULL,
      FOREIGN KEY (lobby_id) REFERENCES lobbies(id)
    )
  `);

  console.log('Database initialized with lobbies and player_items tables.');
};