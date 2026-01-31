const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/doctors', require('./backend/routes/doctorRoutes'));
app.use('/api/slots', require('./backend/routes/slotRoutes'));
app.use('/api/tokens', require('./backend/routes/tokenRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'OPD Token Allocation System',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opd_tokens')
.then(() => {
  console.log('✓ Connected to MongoDB');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
  });
})
.catch((error) => {
  console.error('✗ MongoDB connection error:', error);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
