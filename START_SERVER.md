# How to Start the Server

## Step 1: Make Sure You're in the Root Directory

```bash
# Check you're in the right place
pwd
# Should show: /d/medoc health (or D:\medoc health)

# If you're in backend/, go back:
cd ..
```

## Step 2: Check MongoDB is Running

### Option A: Using MongoDB Atlas (Cloud - Easiest)

1. Make sure your `.env` file has:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/opd_tokens
   ```

### Option B: Using Local MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

## Step 3: Start the Backend Server

```bash
# Make sure you're in root directory
npm run dev
```

You should see:
```
✓ Connected to MongoDB
✓ Server running on port 5000
```

## Step 4: Start the Frontend (in a NEW terminal)

```bash
cd frontend
npm start
```

The frontend will open at http://localhost:3000

## Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB is running
- Verify `.env` file has correct `MONGODB_URI`
- Try MongoDB Atlas if local setup is problematic

### "Port 5000 already in use"
- Change `PORT=5001` in `.env`
- Or kill the process using port 5000

### "ERR_CONNECTION_REFUSED" in browser
- Backend server is not running
- Start it with `npm run dev` from root directory
- Check it's running on port 5000

## Verify Server is Running

Open browser: http://localhost:5000/health

Should see:
```json
{"status":"healthy","service":"OPD Token Allocation System","database":"connected"}
```
