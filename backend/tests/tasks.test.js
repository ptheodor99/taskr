import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/db/connection.js';
import { initDatabase } from '../src/db/migrate.js';

function createTestContext() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'taskr-test-'));
  const databasePath = path.join(directory, 'test.db');
  const database = createDatabase(databasePath);
  initDatabase(database);

  return {
    app: createApp({ database, serveFrontend: false }),
    database,
    directory
  };
}

function cleanupTestContext(context) {
  context.database.close();
  fs.rmSync(context.directory, { recursive: true, force: true });
}

describe('tasks API', () => {
  let context;

  beforeEach(() => {
    context = createTestContext();
  });

  afterEach(() => {
    cleanupTestContext(context);
  });

  it('returns an empty task list and zero stats', async () => {
    const listResponse = await request(context.app).get('/api/tasks').expect(200);
    const statsResponse = await request(context.app).get('/api/tasks/stats').expect(200);

    expect(listResponse.body.data).toEqual([]);
    expect(statsResponse.body.data).toEqual({
      total: 0,
      today: 0,
      inProgress: 0,
      done: 0
    });
  });

  it('creates, fetches, and lists tasks with safe filters', async () => {
    const createResponse = await request(context.app)
      .post('/api/tasks')
      .send({
        title: 'Ship local app',
        description: 'Finish the SQLite-backed workflow',
        status: 'Today',
        priority: 'High',
        dueDate: '2026-05-01'
      })
      .expect(201);

    expect(createResponse.body.data).toMatchObject({
      title: 'Ship local app',
      status: 'Today',
      priority: 'High',
      dueDate: '2026-05-01'
    });

    const id = createResponse.body.data.id;
    const getResponse = await request(context.app).get(`/api/tasks/${id}`).expect(200);
    const listResponse = await request(context.app)
      .get('/api/tasks')
      .query({ search: 'sqlite', status: 'Today', priority: 'High', sort: 'priority' })
      .expect(200);

    expect(getResponse.body.data.id).toBe(id);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].id).toBe(id);
  });

  it('validates create and query input', async () => {
    const createResponse = await request(context.app)
      .post('/api/tasks')
      .send({ title: '', priority: 'Urgent' })
      .expect(400);

    const queryResponse = await request(context.app)
      .get('/api/tasks')
      .query({ status: 'Later' })
      .expect(400);

    expect(createResponse.body.error.message).toBe('title is required');
    expect(queryResponse.body.error.message).toContain('status must be one of');
  });

  it('updates tasks and marks them done', async () => {
    const created = await request(context.app)
      .post('/api/tasks')
      .send({ title: 'Update me' })
      .expect(201);

    const id = created.body.data.id;

    const updated = await request(context.app)
      .put(`/api/tasks/${id}`)
      .send({ title: 'Updated title', status: 'In Progress', priority: 'Medium' })
      .expect(200);

    expect(updated.body.data).toMatchObject({
      title: 'Updated title',
      status: 'In Progress'
    });

    const done = await request(context.app)
      .patch(`/api/tasks/${id}/done`)
      .send({ done: true })
      .expect(200);

    const stats = await request(context.app).get('/api/tasks/stats').expect(200);

    expect(done.body.data.status).toBe('Done');
    expect(done.body.data.completedAt).toEqual(expect.any(String));
    expect(stats.body.data.done).toBe(1);
  });

  it('returns 404 for missing tasks and deletes existing tasks', async () => {
    await request(context.app).get('/api/tasks/999').expect(404);

    const created = await request(context.app)
      .post('/api/tasks')
      .send({ title: 'Delete me' })
      .expect(201);

    const id = created.body.data.id;

    await request(context.app).delete(`/api/tasks/${id}`).expect(204);
    await request(context.app).get(`/api/tasks/${id}`).expect(404);
  });

  it('rejects malformed ids and done payloads', async () => {
    await request(context.app).get('/api/tasks/not-a-number').expect(400);
    await request(context.app).patch('/api/tasks/1/done').send({ done: 'yes' }).expect(400);
  });
});
