import { connectDB } from './db';

export const initDatabase = async () => {
  const db = await connectDB();

  // Create the lobbies table if it doesn't exist
  await db.exec(`
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
};
