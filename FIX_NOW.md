# FIX MONGODB ERROR NOW - 3 STEPS

## The Error Means: MongoDB is NOT running

You're getting `ECONNREFUSED` because MongoDB server is not running on your computer.

## SOLUTION: Use MongoDB Atlas (Cloud - Takes 5 Minutes)

### Step 1: Get Free MongoDB (2 min)

1. Open browser: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up (use Google/GitHub for faster signup)
3. Click **"Build a Database"**
4. Choose **FREE (M0)** - it's free forever
5. Click **"Create"** (wait 3-5 minutes)

### Step 2: Get Connection String (1 min)

1. When cluster is ready, click **"Connect"**
2. Click **"Connect your application"**
3. Copy the connection string
4. Go to **"Database Access"** → Create a user (username + password)
5. Go to **"Network Access"** → Click **"Allow Access from Anywhere"**

### Step 3: Update .env File (2 min)

1. Go to: `D:\medoc health`
2. Open `.env` file (create it if it doesn't exist)
3. Replace `MONGODB_URI` with your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/opd_tokens?retryWrites=true&w=majority
```

**IMPORTANT:** 
- Replace `username` and `password` with your database user credentials
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- Keep `/opd_tokens` before the `?` (this is your database name)

### Step 4: Restart Server

```bash
# Make sure you're in: D:\medoc health
cd "D:\medoc health"

# Stop server (Ctrl+C if running)
# Then start again:
npm run dev
```

## Expected Output (Success!)

```
✓ Connected to MongoDB
✓ Server running on port 5000
✓ API available at http://localhost:5000
```

## If You Still Get Error

1. **Check .env file exists:**
   ```bash
   cd "D:\medoc health"
   dir .env
   ```

2. **Verify connection string format:**
   - Must start with: `mongodb+srv://`
   - Must have username and password
   - Must end with: `?retryWrites=true&w=majority`

3. **Check Atlas:**
   - Is cluster status "Running"?
   - Is IP whitelisted? (Allow from anywhere)
   - Is database user created?

## Quick Test

After server starts, test in browser:
**http://localhost:5000/health**

Should show:
```json
{"status":"healthy","database":"connected"}
```

---

**MongoDB Atlas is FREE and takes 5 minutes to set up. It's the easiest solution!**
