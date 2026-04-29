import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const repoRoot = path.resolve(backendRoot, '..');

dotenv.config({ path: path.join(repoRoot, '.env'), quiet: true });
dotenv.config({ path: path.join(backendRoot, '.env'), override: false, quiet: true });

const resolveFromRepo = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  return path.isAbsolute(value) ? value : path.resolve(repoRoot, value);
};

const parsePort = (value) => {
  const parsed = Number.parseInt(value ?? '3000', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 3000;
};

export const paths = {
  backendRoot,
  repoRoot
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsePort(process.env.PORT),
  databasePath: resolveFromRepo(process.env.SQLITE_DB_PATH, path.join(backendRoot, 'data', 'app.db')),
  frontendDistPath: resolveFromRepo(process.env.FRONTEND_DIST_PATH, path.join(repoRoot, 'frontend', 'dist')),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173'
};
