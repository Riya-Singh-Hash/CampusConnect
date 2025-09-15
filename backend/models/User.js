const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // This creates an index automatically
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'club-member', 'club-admin', 'super-admin'],
    default: 'student'
  },
  studentId: {
    type: String,
    sparse: true, // Allows multiple null values
    unique: true, // This creates an index automatically
    trim: true
  },
  department: {
    type: String,
    enum: [
      'CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CE', 'Other'
    ]
  },
  year: {
    type: Number,
    min: 1,
    max: 4
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  joinedClubs: [{
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  }],
  adminClubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  eventRSVPs: [{
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    status: {
      type: String,
      enum: ['going', 'maybe', 'not-going'],
      required: true
    },
    rsvpAt: {
      type: Date,
      default: Date.now
    }
  }],
  profilePicture: {
    type: String, // URL to profile picture
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  interests: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Manual indexes (only add if not already created by unique: true)
// Removed duplicate indexes that were causing warnings:
// userSchema.index({ email: 1 }); // Already created by unique: true
// userSchema.index({ studentId: 1 }); // Already created by unique: true
userSchema.index({ role: 1 });
userSchema.index({ department: 1, year: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for joined clubs count
userSchema.virtual('joinedClubsCount').get(function() {
  return this.joinedClubs ? this.joinedClubs.length : 0;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastLogin on successful login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user's active clubs
userSchema.methods.getActiveClubs = function() {
  return this.joinedClubs.filter(club => club.status === 'active');
};

// Check if user is admin of a specific club
userSchema.methods.isAdminOf = function(clubId) {
  return this.adminClubs.includes(clubId);
};

// Check if user is member of a specific club
userSchema.methods.isMemberOf = function(clubId) {
  return this.joinedClubs.some(club => 
    club.club.toString() === clubId.toString() && club.status === 'active'
  );
};

module.exports = mongoose.model('User', userSchema);