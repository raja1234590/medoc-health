# OPD Token Allocation System - MERN Stack

A comprehensive backend system for managing Outpatient Department (OPD) token allocation with elastic capacity management, dynamic reallocation, and priority-based scheduling.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 2. Setup Environment

Create `.env` file in root directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/opd_tokens
API_BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/opd_tokens?retryWrites=true&w=majority
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**OR use MongoDB Atlas (Free Cloud):**
- Sign up at: https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Update `.env` file

### 4. Start Backend Server

```bash
# From ROOT directory (not backend/)
npm run dev
```

Server runs on: `http://localhost:5000`

### 5. Start Frontend (Optional)

```bash
cd frontend
npm start
```

Frontend runs on: `http://localhost:3000`

## 📁 Project Structure

```
medoc health/
├── server.js                 # Express server (START HERE)
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── backend/
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   └── services/            # Business logic
├── frontend/                 # React app
└── simulation.js            # Test simulation
```

## 🔧 Important Notes

1. **Always run `npm` commands from ROOT directory**, not from `backend/` or `frontend/`
2. **Backend must be running** before frontend can connect
3. **MongoDB must be running** before backend can start

## 📡 API Endpoints

- `GET /health` - Health check
- `POST /api/doctors` - Create doctor
- `GET /api/doctors` - Get all doctors
- `POST /api/slots` - Create time slot
- `GET /api/slots` - Get all slots
- `POST /api/tokens` - Create token
- `GET /api/tokens` - Get all tokens
- `POST /api/tokens/emergency` - Create emergency token
- `POST /api/tokens/:id/cancel` - Cancel token
- `POST /api/tokens/:id/no-show` - Mark no-show

## 🧪 Run Simulation

```bash
npm run simulate
```

## 📚 Documentation

- `README_MERN.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- `MONGODB_SETUP.md` - MongoDB setup help
- `QUICK_FIX.md` - Troubleshooting
- `START_SERVER.md` - Server startup guide

## ⚠️ Troubleshooting

### "ERR_CONNECTION_REFUSED"
- Backend server is not running
- Start with: `npm run dev` (from root directory)

### "MongoDB connection error"
- MongoDB is not running
- Check `.env` file has correct `MONGODB_URI`
- See `MONGODB_SETUP.md` for help

### "Cannot find module"
- Run `npm install` from root directory

## 🎯 Tech Stack

- **MongoDB** - Database
- **Express.js** - Backend framework
- **React** - Frontend framework
- **Node.js** - Runtime

## 📝 License

Created for backend intern assignment.
