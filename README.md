# FreightSync Logistics App

A full-stack logistics application featuring a React/Vite frontend and a Node.js/Express backend, orchestrated with Docker.

## Project Structure

- **client/**: React frontend (Vite + TailwindCSS)
- **server/**: Node.js backend (Express + Sequelize + SQLite)
- **docker-compose.yml**: Container orchestration (Production/Preview)

## Prerequisites

- **Docker Desktop** (Recommended)
- OR **Node.js** (v18+) and **npm** if running locally without Docker.

---

## 🚀 Quick Start (Docker)

The easiest way to run the application is using Docker. This builds the client and server into a single container which serves the app on port 3000.

1.  **Build and Run**:
    ```bash
    docker-compose up --build
    ```
2.  **Access the App**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: The database (`database.sqlite`) is persisted in the `./server` directory.

---

## 🛠️ Local Development (Manual Setup)

For active development where you want to edit code and see changes immediately (Hot Module Replacement), run the Client and Server separately.

### 1. Server Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Environment Variables**: Create a `.env` file in `server/` with the following content:
    ```env
    PORT=5000
    JWT_SECRET=your_long_random_secret
    NODE_ENV=development
    ```
4.  **Database Seeding** (Optional): To seed the database with initial data (WARNING: This will DROP existing tables):
    ```bash
    node seed.js
    ```
5.  Start the server (Development Mode):
    ```bash
    npm run dev
    ```
    - The server will run on `http://localhost:5000`.
    - Database will be created at `server/database.sqlite`.

### 2. Client Setup

1.  Open a new terminal and navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    - The client will typically run on `http://localhost:5173` (check terminal output).

---

## System Architecture Overview

- **Frontend**: React with Vite (located in `client/`) providing dashboard and auth UI.
- **Backend**: Express.js server (located in `server/`) exposing REST APIs under `/api/*`.
- **Database**: SQLite via Sequelize (file `server/database.sqlite` by default) for simplicity and portability.
- **Auth**: JWT-based authentication (`process.env.JWT_SECRET` required).
- **Dev/Deployment**: `docker-compose.yml` provides a containerized run option; in production the server can serve the built frontend from `server/public`.

## Assumptions and Known Limitations

- **Persistence**: SQLite is used for ease of setup — not intended for scale or high-concurrency production use.
- **Security**: HTTPS, rate limiting, secure cookie handling, and production-ready token rotation are not implemented here.
- **Secrets**: `JWT_SECRET` must be provided via `.env` or container environment; do not commit secrets.
- **Seed script**: `server/seed.js` uses `sequelize.sync({ force: true })` and will DROP tables — use only for development.

## Troubleshooting

-   **Database Issues**: If you encounter database errors, try deleting `server/database.sqlite` (if it's not crucial data) and restarting the server to let Sequelize recreate it.
-   **Port Conflicts**: Ensure ports 3000 and 5000 are free. You can change the server port in `server/.env` and the client API endpoint configuration if needed.
<<<<<<< HEAD
=======
=======
# build2break

## How to run the project

This project can be run with Docker (recommended) or locally using VS Code + `git clone`.

### Docker (recommended)

- Requirements: Docker Desktop (Windows).
- From the project root run:

```bash
# With Docker Compose v2 (recommended)
docker compose up --build

# Or, if using the older docker-compose CLI
docker-compose up --build
```

- The service in `docker-compose.yml` maps port `3000`. Open http://localhost:3000 after the containers start.
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
git clone <REPO_URL> build2break
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

## Problem statement and selected domain

This repository implements a simple freight marketplace prototype (build2break): a platform where shippers create loads and fleets/drivers place bids to carry freight. The selected domain is logistics/freight matching (loads, bids, fleets, drivers, shippers).

Core problem: Provide a minimal full-stack reference that allows shippers to publish loads, fleets to bid, and drivers to view assigned loads with OTP-based pickup/delivery confirmation.

## System architecture overview

- Frontend: React with Vite (located in `client/`) providing dashboard and auth UI.
- Backend: Express.js server (located in `server/`) exposing REST APIs under `/api/*`.
- Database: SQLite via Sequelize (file `server/database.sqlite` by default) for simplicity and portability.
- Auth: JWT-based authentication (`process.env.JWT_SECRET` required).
- Dev/Deployment: `docker-compose.yml` provides a containerized run option; in production the server can serve the built frontend from `server/public`.

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
- Docker setup: `docker-compose.yml` uses a single `web` service and serves port `3000`. Frontend is not built automatically unless you add build steps; the current compose file assumes the server will serve static assets from `server/public` in production.

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
```
>>>>>>> 0a886c8bbca9e3788688d6bcd6b4414f57ddd9ff
>>>>>>> 3660e6f847d728da01e7a1a81db3969b6da553c7
