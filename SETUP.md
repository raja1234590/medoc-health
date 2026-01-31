# Quick Setup Guide - MERN Stack

## Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Setup Environment Variables

**Important**: Create a `.env` file in the root directory (copy from `env.example`):

```bash
# Copy the example file
cp env.example .env
```

Then edit `.env` and update the MongoDB connection string:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/opd_tokens

# OR for MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/opd_tokens?retryWrites=true&w=majority
```

## Step 3: Start MongoDB

### Option A: Local MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Option B: MongoDB Atlas (Cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update `MONGODB_URI` in `.env`

## Step 4: Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# OR production mode
npm start
```

Server will run on `http://localhost:5000`

## Step 5: Start the Frontend (Optional)

In a new terminal:

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

## Step 6: Run Simulation

In another terminal (while backend is running):

```bash
npm run simulate
```

## Verify Installation

1. **Check backend**: Visit `http://localhost:5000/health`
   - Should return: `{"status":"healthy",...}`

2. **Check MongoDB connection**: 
   - Backend logs should show: `✓ Connected to MongoDB`

3. **Test API**: 
   ```bash
   curl http://localhost:5000/health
   ```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify connection string format

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or kill the process using the port

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Frontend Won't Start
- Ensure backend is running first
- Check `REACT_APP_API_URL` in `frontend/.env`
- Clear browser cache

## Next Steps

- Read `README_MERN.md` for detailed documentation
- Explore the API endpoints
- Run the simulation to see the system in action
- Customize the frontend as needed
