import { connectDB } from './db';

export const initDatabase = async () => {
  const db = await connectDB();

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
      gameTime INTEGER NOT NULL,
      status TEXT DEFAULT 'waiting'
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
      PRIMARY KEY (player_id, lobby_id, item_id),
      FOREIGN KEY (lobby_id) REFERENCES lobbies(id)
    )
  `);

  console.log('Database initialized with lobbies and player_items tables.');
};
