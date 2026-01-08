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
3.  Ensure `.env` exists (should be present with default `PORT=5000` and `JWT_SECRET`).
    - *If missing, copy `.env.example` or create one.*
4.  Start the server (Development Mode):
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

## Troubleshooting

-   **Database Issues**: If you encounter database errors, try deleting `server/database.sqlite` (if it's not crucial data) and restarting the server to let Sequelize recreate it.
-   **Port Conflicts**: Ensure ports 3000 and 5000 are free. You can change the server port in `server/.env` and the client API endpoint configuration if needed.
