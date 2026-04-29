import { createApp } from './app.js';
import { closeDatabase, getDatabase } from './db/connection.js';
import { initDatabase } from './db/migrate.js';
import { env } from './config/env.js';

const database = getDatabase();
initDatabase(database);

const app = createApp({ database, serveFrontend: env.nodeEnv === 'production' });
const server = app.listen(env.port, () => {
  console.log(`Taskr listening on port ${env.port}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`);
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
