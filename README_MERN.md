# OPD Token Allocation System - MERN Stack

A comprehensive backend system for managing Outpatient Department (OPD) token allocation with elastic capacity management, dynamic reallocation, and priority-based scheduling.

## Tech Stack

- **MongoDB**: NoSQL database for flexible data storage
- **Express.js**: Web framework for Node.js
- **React**: Frontend UI library
- **Node.js**: JavaScript runtime

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── Doctor.js            # Doctor model
│   │   ├── TimeSlot.js          # Time slot model
│   │   └── Token.js              # Token model
│   ├── routes/
│   │   ├── doctorRoutes.js      # Doctor endpoints
│   │   ├── slotRoutes.js         # Slot endpoints
│   │   └── tokenRoutes.js        # Token endpoints
│   └── services/
│       └── allocationEngine.js   # Core allocation algorithm
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js               # Main React component
│   │   └── index.js             # React entry point
│   └── package.json
├── server.js                    # Express server
├── simulation.js                # Simulation script
├── package.json                 # Backend dependencies
├── .env                         # Environment variables
└── env.example                  # Environment template
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
   - Copy `env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - For local MongoDB: `mongodb://localhost:27017/opd_tokens`
   - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/opd_tokens`

3. **Start MongoDB** (if using local):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
mongod
```

4. **Start the server**:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start React app**:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/opd_tokens

# API Configuration
API_BASE_URL=http://localhost:5000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Doctors
- `POST /api/doctors` - Create a new doctor
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get a specific doctor

### Time Slots
- `POST /api/slots` - Create a time slot
- `GET /api/slots` - Get all slots (with optional filters)
- `GET /api/slots/:id` - Get a specific slot
- `GET /api/slots/:id/availability` - Get slot availability

### Tokens
- `POST /api/tokens` - Create and allocate a token
- `GET /api/tokens` - Get tokens (with optional filters)
- `GET /api/tokens/:id` - Get a specific token
- `POST /api/tokens/:id/allocate` - Manually trigger allocation
- `POST /api/tokens/:id/cancel` - Cancel a token
- `POST /api/tokens/:id/no-show` - Mark token as no-show
- `POST /api/tokens/:id/reallocate` - Reallocate to different slot
- `POST /api/tokens/emergency` - Create emergency token
- `GET /api/tokens/:id/alternatives` - Get alternative slots

## Running the Simulation

```bash
npm run simulate
```

**Prerequisites**: The API server must be running

The simulation:
1. Creates 3 doctors (Cardiology, Orthopedics, General Medicine)
2. Creates 6 time slots per doctor
3. Generates tokens from all sources
4. Simulates cancellations, no-shows, and emergencies
5. Prints comprehensive summary

## Example API Usage

### Create a Doctor
```bash
curl -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{"name": "Dr. John Doe", "specialization": "Cardiology"}'
```

### Create a Time Slot
```bash
curl -X POST http://localhost:5000/api/slots \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "DOCTOR_ID",
    "start_time": "2024-01-15T09:00:00Z",
    "end_time": "2024-01-15T10:00:00Z",
    "max_capacity": 10
  }'
```

### Create a Token
```bash
curl -X POST http://localhost:5000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "DOCTOR_ID",
    "patient_name": "John Smith",
    "source": "online_booking"
  }'
```

### Create Emergency Token
```bash
curl -X POST http://localhost:5000/api/tokens/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "DOCTOR_ID",
    "patient_name": "Emergency Patient",
    "notes": "Urgent case"
  }'
```

## Features

- **Multi-source Token Generation**: Online booking, walk-in, paid priority, follow-up, emergency
- **Dynamic Capacity Management**: Enforces per-slot hard limits with dynamic reallocation
- **Priority-based Allocation**: Intelligent prioritization system
- **Real-world Event Handling**: Cancellations, no-shows, emergency insertions
- **Automatic Slot Filling**: Pending tokens fill slots after cancellations
- **React Frontend**: User-friendly web interface

## Algorithm Details

See `ALGORITHM_DESIGN.md` for detailed algorithm explanation.

## MongoDB Setup

### Local MongoDB

1. **Install MongoDB**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)

2. **Start MongoDB service**:
   - Windows: `net start MongoDB`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. **Connection string**: `mongodb://localhost:27017/opd_tokens`

### MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Development

### Backend Development
```bash
npm run dev  # Starts with nodemon (auto-reload)
```

### Frontend Development
```bash
cd frontend
npm start    # Starts React dev server
```

## Production Deployment

1. **Build React app**:
```bash
cd frontend
npm run build
```

2. **Set environment variables**:
   - `NODE_ENV=production`
   - `MONGODB_URI=<production-mongodb-uri>`

3. **Start server**:
```bash
npm start
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network/firewall settings

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process using the port

### CORS Issues
- Update `CORS_ORIGIN` in `.env`
- Ensure frontend URL matches

## License

This project is created for backend intern assignment purposes.
