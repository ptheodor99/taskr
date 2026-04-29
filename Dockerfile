FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json frontend/
COPY backend/package*.json backend/
RUN npm ci

COPY frontend frontend
RUN npm run build -w frontend

FROM node:20-bookworm-slim AS production-deps

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json backend/
RUN npm ci --omit=dev --workspace backend --include-workspace-root=false

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000
ENV SQLITE_DB_PATH=/app/backend/data/app.db
ENV FRONTEND_DIST_PATH=/app/frontend/dist

WORKDIR /app/backend

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=production-deps /app/backend/package.json /app/backend/package.json
COPY backend /app/backend
COPY --from=build /app/frontend/dist /app/frontend/dist

RUN mkdir -p /app/backend/data

EXPOSE 3000
VOLUME ["/app/backend/data"]

CMD ["node", "src/server.js"]
