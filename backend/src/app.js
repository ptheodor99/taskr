import fs from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { getDatabase } from './db/connection.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { createTaskRepository } from './repositories/taskRepository.js';
import { createTasksRouter } from './routes/tasks.js';
import { createTaskService } from './services/taskService.js';
import { AppError } from './utils/errors.js';

export function createApp({ database = getDatabase(), serveFrontend = env.nodeEnv === 'production' } = {}) {
  const app = express();
  const taskRepository = createTaskRepository(database);
  const taskService = createTaskService(taskRepository);

  app.disable('x-powered-by');

  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: serveFrontend ? undefined : false
  }));
  app.use(compression());
  app.use(cors({
    origin: env.nodeEnv === 'production' ? false : env.corsOrigin,
    credentials: true
  }));
  app.use(express.json({ limit: '100kb' }));

  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  app.get('/api/health', (request, response) => {
    response.json({ data: { status: 'ok' } });
  });

  app.use('/api/tasks', createTasksRouter(taskService));

  if (serveFrontend) {
    const indexPath = path.join(env.frontendDistPath, 'index.html');

    app.use(express.static(env.frontendDistPath, {
      index: false,
      maxAge: env.nodeEnv === 'production' ? '1h' : 0
    }));

    app.get('*', (request, response, next) => {
      if (request.path.startsWith('/api')) {
        next();
        return;
      }

      if (!fs.existsSync(indexPath)) {
        next(new AppError(404, 'Frontend build not found. Run npm run build first.'));
        return;
      }

      response.sendFile(indexPath);
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
