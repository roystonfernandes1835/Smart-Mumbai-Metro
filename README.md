# Smart Rail Mumbai Application

Welcome to the Smart Rail Mumbai project. This project encompasses several micro-services that work together to provide a seamless ticketing, forecasting, and live-heatmap integration for the Mumbai Metro system.

Below is a quick-start guide containing the necessary commands to run each individual service locally.

---

### Prerequisites
Before starting the services, ensure you have the appropriate tools installed:
- **Node.js & npm** (for the Frontend, Backend, Heatmap, and Ticketing services)
- **Python 3 / pip** (for the ML backend engine)
- *If using macOS Homebrew, ensure your path correctly references `/opt/homebrew/bin` if required.*

---

## 1. Backend Service (Port 5000)
This handles the database integration (SQLite), core logic, ticketing endpoints, and WebSockets.

```bash
cd backend
# Ensure dependencies are installed (e.g., sqlite3)
npm install
npm install sqlite3

# Start the server
node index.js
```

---

## 2. Machine Learning Engine (Port 8000)
This is a Python FastAPI service utilizing Prophet/Scikit-learn to handle crowding telemetry and forecasts.

```bash
cd ml
# Optional: It is recommended to use a virtual environment
source venv/bin/activate

# Install the required packages
pip install fastapi uvicorn pydantic prophet pandas scikit-learn

# Run the FastAPI server
python3 main.py
```

---

## 3. Heatmap Micro-service (Port 8080)
This service handles live map renderings and is embedded onto the frontend dashboard. 

```bash
cd heatmap
# Fix binary permissions if "Permission denied" errors occur
chmod -R +x node_modules/.bin

# Start the development server on port 8080
npm run dev -- --port 8080
```

---

## 4. Frontend Application (Port 3000)
This runs the primary gateway, commuter dashboards, admin portals, and renders the live ticketing interfaces.

```bash
cd frontend
# Fix binary permissions if "Permission denied" errors occur
chmod -R +x node_modules/.bin

# Start the interface
npm run dev
```

---

## 5. Ticketing Module (If run independently)
The ticketing module can also be worked on directly from its directory:

```bash
cd ticketing
# Install any missing dependencies
npm install

# Start the development server
npm run dev
```

## 🔐 Security
- Role-based authentication (Admin-only access)
- JWT-based secure login system
- Protected admin dashboard

### Note on Permissions
If you encounter `sh: ... node_modules/.bin/vite: Permission denied`, run `chmod -R +x node_modules/.bin` inside that specific project's directory to grant executable permissions.
