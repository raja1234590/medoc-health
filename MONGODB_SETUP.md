# MongoDB Setup Guide

## Issue: MongoDB Connection Error

If you see `connect ECONNREFUSED ::1:27017`, it means MongoDB is not running or not accessible.

## Solution Options

### Option 1: Install and Start Local MongoDB (Recommended for Development)

#### Windows:

1. **Download MongoDB Community Server**:
   - Go to: https://www.mongodb.com/try/download/community
   - Select Windows, download MSI installer
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)

2. **Start MongoDB Service**:
   ```bash
   net start MongoDB
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   ```
   If it connects, you're good to go!

#### macOS:

1. **Install with Homebrew**:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB**:
   ```bash
   brew services start mongodb-community
   ```

#### Linux (Ubuntu/Debian):

1. **Install MongoDB**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb
   ```

2. **Start MongoDB**:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

### Option 2: Use MongoDB Atlas (Cloud - Free Tier Available)

1. **Create Account**:
   - Go to: https://www.mongodb.com/cloud/atlas/register

2. **Create a Free Cluster**:
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a cloud provider and region
   - Click "Create"

3. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`

4. **Update .env file**:
   ```env
   
   ```
   Replace `username` and `password` with your Atlas credentials.

5. **Whitelist IP Address**:
   - In Atlas, go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP

### Option 3: Use Docker (If you have Docker installed)

1. **Run MongoDB in Docker**:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Verify it's running**:
   ```bash
   docker ps
   ```

## Verify MongoDB Connection

After starting MongoDB, test the connection:

```bash
# Using mongosh (MongoDB Shell)
mongosh

# Or using mongo (older versions)
mongo
```

If you see the MongoDB prompt, it's working!

## Common Issues

### Issue: "MongoDB service not found"
**Solution**: MongoDB might not be installed as a service. Install it first.

### Issue: "Port 27017 already in use"
**Solution**: Another MongoDB instance might be running. Check:
```bash
# Windows
netstat -ano | findstr :27017

# macOS/Linux
lsof -i :27017
```

### Issue: "Access denied"
**Solution**: 
- Check MongoDB is running: `net start MongoDB` (Windows)
- Check firewall settings
- For Atlas: Check IP whitelist

## Quick Test

Once MongoDB is running, try starting your server again:

```bash
# From the ROOT directory (not backend/)
npm run dev
```

You should see:
```
✓ Connected to MongoDB
✓ Server running on port 5000
```

## Project Structure Reminder

**Important**: Run commands from the ROOT directory, not from `backend/`:

```
medoc health/          ← Run npm commands HERE
├── server.js          ← Main server file is HERE
├── package.json       ← Dependencies are HERE
├── backend/           ← Don't run npm here
│   ├── models/
│   ├── routes/
│   └── services/
└── frontend/
```

## Still Having Issues?

1. Check MongoDB is installed: `mongosh --version`
2. Check MongoDB is running: `net start MongoDB` (Windows)
3. Check your `.env` file has correct `MONGODB_URI`
4. Try MongoDB Atlas (cloud) if local setup is problematic
