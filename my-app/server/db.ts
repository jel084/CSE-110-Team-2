// db.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let dbInstance: Database | null = null;

export const connectDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  return dbInstance;
};
