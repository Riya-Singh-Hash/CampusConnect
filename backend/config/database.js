const mongoose = require('mongoose');

// Database connection options (only modern, supported options)
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
  // Removed deprecated options:
  // useNewUrlParser: true (deprecated)
  // useUnifiedTopology: true (deprecated)
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔴 Mongoose disconnected from MongoDB');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('👋 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Log specific error details
    if (error.name === 'MongoNetworkError') {
      console.error('🌐 Network Error: Check your internet connection and MongoDB URI');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('🔐 Authentication Error: Check your MongoDB credentials');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('🖥️  Server Selection Error: MongoDB server is not accessible');
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

// Disconnect from database
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

// Check database connection status
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[state],
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

// Database health check
const healthCheck = async () => {
  try {
    const adminDB = mongoose.connection.db.admin();
    const result = await adminDB.ping();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      result
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  checkConnection,
  healthCheck
};