const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is inactive. Please contact admin.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token.' 
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Not authenticated.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Club admin authorization middleware
const clubAdmin = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const userId = req.user._id;

    // Super admin can access everything
    if (req.user.role === 'super-admin') {
      return next();
    }

    // Check if user is admin of the specific club
    if (req.user.adminClubs.includes(clubId)) {
      return next();
    }

    return res.status(403).json({ 
      success: false,
      message: 'Access denied. You are not an admin of this club.' 
    });
  } catch (error) {
    console.error('Club admin middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error in authorization check.' 
    });
  }
};

module.exports = { auth, authorize, clubAdmin };