# FreightSync

**FreightSync** is a secure, containerized freight marketplace application connecting shippers with fleet managers. It features load creation, bidding, and shipment tracking with OTP verification.

## 🚀 Quick Start (Docker)

The easiest way to run the project.

### Prerequisites
- Docker Desktop (Windows/Mac/Linux)
- [Ngrok Authtoken](https://dashboard.ngrok.com/get-started/your-authtoken) (Optional, for public access)

### 1. Run the Application
All infrastructure configuration is in the `infra` directory.

```bash
cd infra
docker-compose up --build
```
- **Local Access**: [http://localhost:3000](http://localhost:3000)
- **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 2. Run with Public Access (Ngrok)
To expose your local environment to the internet (e.g., for demos):

**PowerShell:**
```powershell
cd infra
$env:NGROK_AUTHTOKEN="YOUR_AUTHTOKEN_HERE"; docker-compose up
```

**CMD:**
```cmd
cd infra
set NGROK_AUTHTOKEN=YOUR_AUTHTOKEN_HERE && docker-compose up
```
- Access via the **Public URL** printed in the terminal (starts with `https://...ngrok-free.dev`).

---

## 🔒 Security Features

- **Rate Limiting**:
    - OTP Verification: Strict limit of **3 attempts per minute**.
    - Load Creation: Limited to 5 requests per 15 minutes.
- **DDoS Protection**:
    - JSON payloads limited to **10kb**.
- **Data Integrity**:
    - Loads are strictly assigned to the authenticated Shipper (Spoofing prevention).
    - Database errors are masked to prevent information leakage.
- **Authentication**:
    - JWT-based auth with a strong 256-bit secure secret.

---

## 🏗️ Architecture

- **Frontend**: React + Vite (Port 80/3000)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: SQLite (Persisted in `./server/database.sqlite`)
- **Gateway**: Nginx (Reverse Proxy)
- **Tunnel**: Ngrok (Public Access)

### Directory Structure
- `client/`: React Frontend code
- `server/`: Express Backend code
- `infra/`: Docker infrastructure (`docker-compose.yml`)

## 🛠️ Local Development (No Docker)

If you prefer running without Docker:

**Server:**
```bash
cd server
npm install
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```
*Note: Ensure `client/.env` or proxy config points to port 5000.*

## 🧪 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Shipper** | `shipper@test.com` | `1234` |
| **Fleet** | `fleet@test.com` | `1234` |
| **Driver** | `driver@test.com` | `1234` |
