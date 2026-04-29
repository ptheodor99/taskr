import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { env } from '../config/env.js';

let sharedDatabase;

export function ensureDatabaseDirectory(databasePath = env.databasePath) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

export function createDatabase(databasePath = env.databasePath) {
  ensureDatabaseDirectory(databasePath);

  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');
  database.pragma('busy_timeout = 5000');

  return database;
}

export function getDatabase() {
  if (!sharedDatabase) {
    sharedDatabase = createDatabase();
  }

  return sharedDatabase;
}

export function closeDatabase() {
  if (sharedDatabase) {
    sharedDatabase.close();
    sharedDatabase = undefined;
  }
}
