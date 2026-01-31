# MongoDB Connection Error - QUICK FIX

## The Problem
Error: `ECONNREFUSED ::1:27017` means **MongoDB is NOT running** on your computer.

## EASIEST SOLUTION: Use MongoDB Atlas (Cloud - FREE)

### Step 1: Create Free MongoDB Atlas Account (2 minutes)

1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with email (or use Google/GitHub)
3. Click "Build a Database"
4. Choose **FREE (M0) tier** - it's free forever
5. Select a cloud provider (AWS, Google, Azure) - any is fine
6. Choose a region closest to you
7. Click **"Create"** (takes 3-5 minutes)

### Step 2: Get Connection String (1 minute)

1. Once cluster is created, click **"Connect"** button
2. Click **"Connect your application"**
3. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 3: Create Database User

1. In Atlas, click **"Database Access"** (left menu)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password (remember these!)
5. Click **"Add User"**

### Step 4: Whitelist Your IP

1. In Atlas, click **"Network Access"** (left menu)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - OR add your specific IP address
4. Click **"Confirm"**

### Step 5: Update Your .env File

1. Go to your project root: `D:\medoc health`
2. Create or edit `.env` file
3. Replace the connection string:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/opd_tokens?retryWrites=true&w=majority
API_BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000
```

**Replace:**
- `YOUR_USERNAME` with your database username
- `YOUR_PASSWORD` with your database password
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- Make sure to add `/opd_tokens` before the `?` (this is the database name)

### Step 6: Restart Server

```bash
# Make sure you're in root directory
cd "D:\medoc health"

# Stop current server (Ctrl+C) and restart
npm run dev
```

You should see:
```
✓ Connected to MongoDB
✓ Server running on port 5000
```

## ALTERNATIVE: Install Local MongoDB

If you prefer local MongoDB:

### Windows Installation:

1. **Download MongoDB:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Click Download

2. **Install:**
   - Run the installer
   - Choose "Complete" installation
   - **IMPORTANT:** Check "Install MongoDB as a Service"
   - Click "Install"

3. **Start MongoDB:**
   ```bash
   net start MongoDB
   ```

4. **Verify it's running:**
   ```bash
   mongosh
   ```
   If you see MongoDB shell, it's working!

5. **Your .env should be:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/opd_tokens
   ```

## Still Having Issues?

1. **Check .env file exists:**
   ```bash
   cd "D:\medoc health"
   dir .env
   ```

2. **If .env doesn't exist, create it:**
   ```bash
   copy env.example .env
   ```

3. **Verify MongoDB connection string:**
   - For Atlas: Must start with `mongodb+srv://`
   - For local: Must be `mongodb://localhost:27017/opd_tokens`

4. **Test MongoDB connection:**
   ```bash
   # For Atlas - test in browser:
   # Open your Atlas dashboard, click "Connect" → "Connect your application"
   
   # For local - test with:
   mongosh
   ```

## Why MongoDB Atlas is Better for Development

✅ No installation needed
✅ Works immediately
✅ Free tier is generous (512MB storage)
✅ Accessible from anywhere
✅ No local setup headaches
✅ Perfect for learning/development
