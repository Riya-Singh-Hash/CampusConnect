const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Club name must be at least 3 characters'],
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Club description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Club category is required'],
    enum: [
      'Technical',
      'Cultural', 
      'Social Service',
      'Environmental',
      'Innovation & Entrepreneurship',
      'Sports',
      'Academic',
      'Personality Development',
      'Professional Development',
      'Media & Communication',
      'Health & Wellbeing'
    ]
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Institution-wide',
      'CSE/ISE',
      'ECE',
      'EEE', 
      'Mechanical Engineering',
      'Civil Engineering',
      'Open to all students',
      'Multi-disciplinary',
      'CSE/ISE (tech-focused)',
      'ECE (exclusive)',
      'Cultural club',
      'Environmental initiative',
      'Social initiative',
      'Under Placement Cell'
    ],
    default: 'Institution-wide'
  },
  focus: {
    type: String,
    required: [true, 'Club focus is required'],
    trim: true,
    maxlength: [200, 'Focus cannot exceed 200 characters']
  },
  logo: {
    type: String, // URL to club logo
    default: null
  },
  bannerImage: {
    type: String, // URL to banner image
    default: null
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    role: {
      type: String,
      enum: ['member', 'volunteer', 'coordinator'],
      default: 'member'
    }
  }],
  admins: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'president', 'vice-president', 'secretary', 'treasurer'],
      default: 'admin'
    },
    appointedAt: {
      type: Date,
      default: Date.now
    }
  }],
  pendingRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      maxlength: [500, 'Request message cannot exceed 500 characters']
    }
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    socialMedia: {
      instagram: String,
      twitter: String,
      linkedin: String,
      facebook: String,
      website: String
    }
  },
  meetingSchedule: {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    time: String,
    location: String,
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'as-needed'],
      default: 'weekly'
    }
  },
  achievements: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    date: Date,
    image: String, // URL to achievement image/certificate
    category: {
      type: String,
      enum: ['award', 'recognition', 'event', 'project', 'competition', 'other'],
      default: 'other'
    }
  }],
  rules: [String], // Club rules and regulations
  isActive: {
    type: Boolean,
    default: true
  },
  establishedDate: {
    type: Date,
    default: Date.now
  },
  maxMembers: {
    type: Number,
    min: 1,
    default: 100
  },
  joinApprovalRequired: {
    type: Boolean,
    default: false
  },
  tags: [String], // Tags for searching and categorization
  stats: {
    totalEvents: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 0
    },
    averageAttendance: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
clubSchema.index({ category: 1 });
clubSchema.index({ department: 1 });
clubSchema.index({ tags: 1 });
clubSchema.index({ isActive: 1 });
clubSchema.index({ 'members.user': 1 });
clubSchema.index({ 'admins.user': 1 });

// Virtual for active members count
clubSchema.virtual('activeMembersCount').get(function() {
  return this.members ? this.members.filter(member => member.status === 'active').length : 0;
});

// Virtual for active events count
clubSchema.virtual('activeEventsCount').get(function() {
  return this.events ? this.events.length : 0;
});

// Virtual for club age
clubSchema.virtual('clubAge').get(function() {
  const now = new Date();
  const established = new Date(this.establishedDate);
  const diffTime = Math.abs(now - established);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365);
});

// Pre-save middleware to update stats
clubSchema.pre('save', function(next) {
  if (this.members) {
    this.stats.totalMembers = this.members.filter(member => member.status === 'active').length;
  }
  next();
});

// Method to add member
clubSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.status = 'active';
    existingMember.role = role;
  } else {
    this.members.push({
      user: userId,
      role: role,
      status: 'active'
    });
  }
  
  return this.save();
};

// Method to remove member
clubSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to add admin
clubSchema.methods.addAdmin = function(userId, role = 'admin') {
  const existingAdmin = this.admins.find(admin => 
    admin.user.toString() === userId.toString()
  );
  
  if (!existingAdmin) {
    this.admins.push({
      user: userId,
      role: role
    });
  }
  
  return this.save();
};

// Method to check if user is member
clubSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && member.status === 'active'
  );
};

// Method to check if user is admin
clubSchema.methods.isAdmin = function(userId) {
  return this.admins.some(admin => 
    admin.user.toString() === userId.toString()
  );
};

// Method to get member role
clubSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString() && member.status === 'active'
  );
  return member ? member.role : null;
};

module.exports = mongoose.model('Club', clubSchema);