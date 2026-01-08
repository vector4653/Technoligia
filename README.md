# build2break

## domain: Logi-Tech

## Problem statement and selected domain

This repository implements a simple freight marketplace: a platform where shippers create loads and fleet manager/drivers place bids to carry freight. The domain is logistics/freight matching (loads, bids, fleets, drivers, shippers).

Core problem: Provide a minimal full-stack reference that allows shippers to publish loads, fleets to bid, and drivers to view assigned loads with OTP-based pickup/delivery confirmation.

## How to run the project

This project can be run with Docker (recommended) or locally using VS Code + `git clone`.

### Docker (recommended)

- Requirements: Docker Desktop (Windows).
- From the project root run:

```bash
git clone <https://github.com/vector4653/Technoligia.git> build2break
cd build2break
# With Docker Compose v2 (recommended)
docker compose up --build

# Or, if using the older docker-compose CLI
docker-compose up --build
```

- The `client` service maps port `3000` (frontend).
- The `server` service maps port `5000` (backend API).
- Open http://localhost:3000 to access the application.
- To stop and remove containers:

```bash
docker compose down
```

- Notes:
	- The compose file mounts `./server/database.sqlite` so database state persists across restarts.
	- Ensure Docker has access to the project folder on Windows.

### VS Code + Git (local development)

- Prerequisites: Node.js (>=16), npm, VS Code (optional but recommended).
- Clone the repository and open it in VS Code:

```bash
git clone <https://github.com/vector4653/Technoligia.git> build2break
cd build2break
```

- Server (Express + SQLite):

```bash
cd server
npm install
# Option A: run in production mode
npm run start

# Option B: run in development with auto-reload (requires nodemon)
npm run dev
```

- Client (React + Vite):

```bash
cd client
npm install
npm run dev
```

- Common endpoints:
	- Health check: `GET /api/health` (e.g. http://localhost:3000/api/health)
	- API roots: `/api/auth`, `/api/loads`


## System architecture overview

- Frontend: React with Vite (located in `client/`) providing dashboard and auth UI. Served via Nginx in Docker.
- Backend: Express.js server (located in `server/`) exposing REST APIs under `/api/*`.
- Database: SQLite via Sequelize (file `server/database.sqlite` by default) for simplicity and portability.
- Auth: JWT-based authentication (`process.env.JWT_SECRET` required).
- Dev/Deployment: `docker-compose.yml` orchestrates `client` and `server` services.

## Setup and testing instructions (details)

1. Environment variables

Create a `.env` file in `server/` with at least:

```
PORT=3000
JWT_SECRET=your_long_random_secret
NODE_ENV=development
```

2. Seed the database (optional, will DROP & recreate tables)

```bash
cd server
node seed.js
```

3. Manual testing

- Open the health route: `GET /api/health`.
- Use Postman / curl to exercise auth (`/api/auth`) and load endpoints (`/api/loads`).

4. Notes about running client + server concurrently

- The server listens on `process.env.PORT` (default `5000` if not provided). In this repo Docker maps `3000`.
- Vite dev server runs on `5173` by default; when running both locally open the client dev URL (usually http://localhost:5173) and ensure API calls point to the server port.

## Assumptions and known limitations

- Persistence: SQLite is used for ease of setup — not intended for scale or high-concurrency production use.
- Security: HTTPS, rate limiting, secure cookie handling, and production-ready token rotation are not implemented here.
- Secrets: `JWT_SECRET` must be provided via `.env` or container environment; do not commit secrets.
- Seed script: `server/seed.js` uses `sequelize.sync({ force: true })` and will DROP tables — use only for development.
- Docker setup: `docker-compose.yml` runs two services: `client` (Nginx serving React build) and `server` (Express API).

## Useful commands summary

```bash
# Docker (root)
docker compose up --build
docker compose down

# Local (server)
cd server
npm install
npm run dev   # nodemon
node seed.js  # optional: seed DB (drops tables)

# Local (client)
cd client
npm install
npm run dev   # vite dev server
