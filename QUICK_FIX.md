# Quick Fix Guide

## Problem 1: Running from Wrong Directory

You're in `backend/` directory, but `server.js` is in the root!

**Solution**: Go back to root directory:

```bash
cd ..
# Now you should be in: /d/medoc health/
npm run dev
```

## Problem 2: MongoDB Not Running

The error `connect ECONNREFUSED` means MongoDB is not running.

### Quick Fix - Use MongoDB Atlas (Easiest)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create free cluster (takes 3-5 minutes)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update your `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/opd_tokens?retryWrites=true&w=majority
```

Replace `username` and `password` with your Atlas credentials.

7. In Atlas, go to "Network Access" and click "Allow Access from Anywhere"

### Or Install Local MongoDB

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install (choose "Complete" and "Install as Service")
3. Start: `net start MongoDB`

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

## Step-by-Step Fix

1. **Go to root directory**:
   ```bash
   cd /d/medoc\ health
   # or
   cd "D:\medoc health"
   ```

2. **Check if .env exists**:
   ```bash
   ls .env
   # or
   dir .env
   ```

3. **If .env doesn't exist, create it**:
   ```bash
   copy env.example .env
   # or
   cp env.example .env
   ```

4. **Edit .env and set MongoDB URI**:
   - For local: `MONGODB_URI=mongodb://localhost:27017/opd_tokens`
   - For Atlas: `MONGODB_URI=mongodb+srv://...`

5. **Start MongoDB** (if using local):
   ```bash
   net start MongoDB
   ```

6. **Start server from ROOT**:
   ```bash
   npm run dev
   ```

## Expected Output

When everything works, you should see:

```
[nodemon] starting `node server.js`
✓ Connected to MongoDB
✓ Server running on port 5000
✓ API available at http://localhost:5000
✓ Health check: http://localhost:5000/health
```

## Verify Server is Running

Open browser or use curl:
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"healthy","service":"OPD Token Allocation System","database":"connected"}
```
