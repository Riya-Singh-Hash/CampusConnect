const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize express app first
const app = express();

console.log('🔧 Starting server initialization...');

// Basic middleware first
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'BIT Club Management System API',
    version: '1.0.0',
    status: 'Server is responding',
    timestamp: new Date().toISOString()
  });
});

// Import and connect database after basic setup
let dbConnected = false;
try {
  const { connectDB } = require('./config/database');
  connectDB().then(() => {
    dbConnected = true;
    console.log('✅ Database connection successful');
  }).catch(err => {
    console.error('❌ Database connection failed:', err.message);
    dbConnected = false;
  });
} catch (error) {
  console.error('❌ Error importing database config:', error.message);
}

// Import routes with error handling
try {
  const authRoutes = require('./routes/auth');
  const clubRoutes = require('./routes/clubs');
  const eventRoutes = require('./routes/events');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/clubs', clubRoutes);
  app.use('/api/events', eventRoutes);
  
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BIT Club Management System API',
    environment: 'development',
    database: dbConnected ? 'connected' : 'disconnected',
    endpoints: {
      health: '/health',
      test: '/test',
      api: '/api'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global Error:', error.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server with better error handling
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
  
  console.log(`
🚀 Server is running successfully!

🌍 Environment: ${process.env.NODE_ENV || 'development'}
📡 Port: ${PORT}
🔗 Server: http://localhost:${PORT}
🧪 Test: http://localhost:${PORT}/test
💊 Health: http://localhost:${PORT}/health
📚 API: http://localhost:${PORT}/api

✅ Server is ready to accept connections!
  `);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try: npx kill-port 5000');
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});

module.exports = app;