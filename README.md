# Taskr

Taskr is a polished local-first task management app built with React, Vite, Express, and SQLite. It runs as a single production server, serves the frontend from the backend, and stores tasks in a local SQLite database.

## Features

- Create, edit, delete, and complete tasks
- Status workflow: Inbox, Today, In Progress, Done
- Priorities: Low, Medium, High
- Due dates and descriptions
- Search, status filters, priority filters, and sorting
- Dashboard counters for total, today, in progress, and done
- Dark responsive SaaS-style UI
- Local SQLite persistence
- Docker and manual setup
- Backend and frontend tests

## Project Structure

```text
.
|-- backend
|   |-- data
|   |   `-- app.db
|   |-- scripts
|   |-- src
|   |   |-- config
|   |   |-- db
|   |   |-- middleware
|   |   |-- repositories
|   |   |-- routes
|   |   |-- services
|   |   `-- utils
|   `-- tests
|-- frontend
|   `-- src
|       |-- api
|       |-- components
|       `-- utils
|-- Dockerfile
`-- docker-compose.yml
```

## Requirements

- Node.js 20+
- npm 9+
- Docker Desktop, optional

## Manual Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the database schema:

   ```bash
   npm run db:init
   ```

3. Seed example tasks, optional:

   ```bash
   npm run db:seed
   ```

4. Start both dev servers:

   ```bash
   npm run dev
   ```

The frontend runs at [http://localhost:5173](http://localhost:5173) and proxies API requests to the backend at [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm run start
```

The backend serves the built frontend from `frontend/dist` on a single port. The default production URL is [http://localhost:3000](http://localhost:3000).

## Docker

Build and run the app with one command:

```bash
docker compose up --build
```

The app is available at [http://localhost:3000](http://localhost:3000). SQLite data is persisted through the `taskr-data` Docker volume mounted at `/app/backend/data`.

Useful Docker commands:

```bash
docker compose down
docker compose down -v
```

The second command also removes the persisted database volume.

## Environment

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

Important variables:

- `PORT`: backend server port, default `3000`
- `SQLITE_DB_PATH`: path to the SQLite database
- `CORS_ORIGIN`: allowed dev frontend origin
- `FRONTEND_DIST_PATH`: location of the built frontend for production serving
- `VITE_API_BASE_URL`: optional frontend API base URL; leave empty for same-origin API calls
- `VITE_API_PROXY_TARGET`: Vite dev proxy target

## Scripts

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run start
npm run db:init
npm run db:seed
npm run test
npm run test:backend
npm run test:frontend
```

## API

Base path: `/api`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tasks` | List tasks with search, filters, and sort |
| `GET` | `/api/tasks/stats` | Dashboard counters |
| `GET` | `/api/tasks/:id` | Fetch one task |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `PATCH` | `/api/tasks/:id/done` | Mark a task done or not done |
| `DELETE` | `/api/tasks/:id` | Delete a task |

Query parameters for `GET /api/tasks`:

- `search`: searches title and description
- `status`: Inbox, Today, In Progress, or Done
- `priority`: Low, Medium, or High
- `sort`: `newest`, `due`, or `priority`

## Testing

Run all tests:

```bash
npm run test
```

Backend tests use Supertest and a temporary SQLite test database. Frontend tests use Vitest, React Testing Library, and mocked API calls.

## Notes

- SQLite access uses prepared statements through `better-sqlite3`.
- The backend creates `backend/data` automatically when the database opens.
- Production frontend API calls default to same-origin `/api` requests, so no production localhost URL is baked into the bundle.
