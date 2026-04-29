import { closeDatabase, getDatabase } from '../src/db/connection.js';
import { initDatabase } from '../src/db/migrate.js';
import { env } from '../src/config/env.js';

const database = getDatabase();
initDatabase(database);
closeDatabase();

console.log(`SQLite database initialized at ${env.databasePath}`);
