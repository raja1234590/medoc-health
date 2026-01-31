# 🔴 MONGODB ERROR - SOLUTION

## Problem
**MongoDB is NOT running on your computer.**

The error `ECONNREFUSED 127.0.0.1:27017` means your app is trying to connect to MongoDB on localhost, but MongoDB server is not installed or not running.

## ✅ EASIEST FIX: MongoDB Atlas (Cloud - FREE)

### Do This Now (5 minutes):

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** (use Google/GitHub for faster signup)
3. **Click "Build a Database"**
4. **Choose FREE (M0) tier** - it's completely free
5. **Select any cloud provider** (AWS, Google, Azure - doesn't matter)
6. **Choose region** closest to you
7. **Click "Create"** - wait 3-5 minutes

### Get Connection String:

1. When cluster is ready, click **"Connect"** button
2. Click **"Connect your application"**
3. **Copy the connection string** - looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Create Database User:

1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** method
4. Enter **username** and **password** (remember these!)
5. Click **"Add User"**

### Allow Network Access:

1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

### Update Your .env File:

1. Go to: `D:\medoc health`
2. Open `.env` file (or create it from `env.example`)
3. **Replace** the `MONGODB_URI` line with:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/opd_tokens?retryWrites=true&w=majority
```

**Replace:**
- `YOUR_USERNAME` → your database username
- `YOUR_PASSWORD` → your database password  
- `cluster0.xxxxx.mongodb.net` → your actual cluster URL from Atlas

**IMPORTANT:** Make sure to add `/opd_tokens` before the `?` - this is your database name!

### Restart Server:

```bash
# Make sure you're in: D:\medoc health (NOT backend/)
cd "D:\medoc health"

# Stop server (Ctrl+C) if running
# Then start:
npm run dev
```

## ✅ Success Looks Like:

```
✓ Connected to MongoDB
✓ Server running on port 5000
✓ API available at http://localhost:5000
```

## Test It:

Open browser: **http://localhost:5000/health**

Should show:
```json
{"status":"healthy","database":"connected"}
```

---

## Why This Works:

- ✅ No installation needed
- ✅ Works immediately  
- ✅ Free forever (512MB storage)
- ✅ No local setup headaches
- ✅ Perfect for development

**MongoDB Atlas is the easiest solution - just takes 5 minutes to set up!**
