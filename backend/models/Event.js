const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minlength: [3, 'Event title must be at least 3 characters'],
    maxlength: [200, 'Event title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time in HH:MM format']
  },
  endTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid end time in HH:MM format']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  venue: {
    type: {
      type: String,
      enum: ['physical', 'online', 'hybrid'],
      default: 'physical'
    },
    address: String,
    room: String,
    building: String,
    onlineLink: String, // For online/hybrid events
    platform: String // Zoom, Teams, etc.
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'Event must belong to a club']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event creator is required']
  },
  category: {
    type: String,
    enum: [
      'workshop',
      'seminar',
      'competition',
      'meeting',
      'social',
      'cultural',
      'technical',
      'sports',
      'academic',
      'networking',
      'fundraising',
      'volunteering',
      'other'
    ],
    default: 'other'
  },
  type: {
    type: String,
    enum: ['public', 'members-only', 'invite-only'],
    default: 'members-only'
  },
  rsvps: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['going', 'maybe', 'not-going'],
      required: true
    },
    rsvpAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      maxlength: [500, 'RSVP note cannot exceed 500 characters']
    }
  }],
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedInAt: {
      type: Date,
      default: Date.now
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  maxCapacity: {
    type: Number,
    min: 1,
    default: 100
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationDeadline: Date,
  fee: {
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    description: String // What the fee covers
  },
  prerequisites: [String], // Skills or items required
  agenda: [{
    time: String,
    activity: String,
    speaker: String,
    duration: Number // in minutes
  }],
  speakers: [{
    name: {
      type: String,
      required: true
    },
    title: String,
    organization: String,
    bio: String,
    image: String, // URL to speaker photo
    linkedIn: String,
    twitter: String
  }],
  materials: [{
    name: String,
    type: {
      type: String,
      enum: ['document', 'presentation', 'video', 'link', 'other'],
      default: 'document'
    },
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String], // For searching and categorization
  poster: {
    type: String, // URL to event poster
    default: null
  },
  images: [String], // URLs to event images
  socialMedia: {
    hashtag: String,
    facebookEvent: String,
    linkedInEvent: String
  },
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: {
      type: Date,
      default: Date.now
    },
    isAnonymous: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'club-members', 'department', 'college'],
    default: 'club-members'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: Number, // Every X days/weeks/months/years
    endDate: Date,
    daysOfWeek: [Number] // For weekly recurring (0 = Sunday, 1 = Monday, etc.)
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in-app'],
      default: 'email'
    },
    timeBeforeEvent: Number, // in minutes
    sent: {
      type: Boolean,
      default: false
    }
  }],
  stats: {
    views: {
      type: Number,
      default: 0
    },
    totalRSVPs: {
      type: Number,
      default: 0
    },
    actualAttendance: {
      type: Number,
      default: 0
    },
    averageRating: {
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
eventSchema.index({ date: 1 });
eventSchema.index({ club: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ 'rsvps.user': 1 });
eventSchema.index({ title: 'text', description: 'text' }); // Text search

// Virtual for RSVP counts
eventSchema.virtual('rsvpCounts').get(function() {
  const counts = {
    going: 0,
    maybe: 0,
    notGoing: 0,
    total: this.rsvps ? this.rsvps.length : 0
  };
  
  if (this.rsvps) {
    this.rsvps.forEach(rsvp => {
      if (rsvp.status === 'going') counts.going++;
      else if (rsvp.status === 'maybe') counts.maybe++;
      else if (rsvp.status === 'not-going') counts.notGoing++;
    });
  }
  
  return counts;
});

// Virtual for event duration
eventSchema.virtual('duration').get(function() {
  if (!this.endTime) return null;
  
  const [startHour, startMin] = this.time.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes - startMinutes; // Duration in minutes
});

// Virtual for event status based on date
eventSchema.virtual('eventStatus').get(function() {
  const now = new Date();
  const eventDate = new Date(this.date);
  
  if (this.status === 'cancelled') return 'cancelled';
  if (eventDate < now) return 'completed';
  if (eventDate.toDateString() === now.toDateString()) return 'today';
  return 'upcoming';
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  const goingCount = this.rsvps ? this.rsvps.filter(rsvp => rsvp.status === 'going').length : 0;
  return Math.max(0, this.maxCapacity - goingCount);
});

// Pre-save middleware to update stats
eventSchema.pre('save', function(next) {
  if (this.rsvps) {
    this.stats.totalRSVPs = this.rsvps.length;
  }
  
  if (this.feedback && this.feedback.length > 0) {
    const totalRating = this.feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0);
    this.stats.averageRating = Math.round((totalRating / this.feedback.length) * 10) / 10;
  }
  
  next();
});

// Method to add RSVP
eventSchema.methods.addRSVP = function(userId, status, note) {
  const existingRSVP = this.rsvps.find(rsvp => 
    rsvp.user.toString() === userId.toString()
  );
  
  if (existingRSVP) {
    existingRSVP.status = status;
    existingRSVP.note = note;
    existingRSVP.rsvpAt = new Date();
  } else {
    this.rsvps.push({
      user: userId,
      status: status,
      note: note
    });
  }
  
  return this.save();
};

// Method to check if user has RSVP'd
eventSchema.methods.hasRSVP = function(userId) {
  return this.rsvps.some(rsvp => 
    rsvp.user.toString() === userId.toString()
  );
};

// Method to get user's RSVP
eventSchema.methods.getUserRSVP = function(userId) {
  return this.rsvps.find(rsvp => 
    rsvp.user.toString() === userId.toString()
  );
};

// Method to check in attendee
eventSchema.methods.checkInAttendee = function(userId, checkedInBy) {
  const existingAttendee = this.attendees.find(attendee => 
    attendee.user.toString() === userId.toString()
  );
  
  if (!existingAttendee) {
    this.attendees.push({
      user: userId,
      checkedInBy: checkedInBy
    });
    this.stats.actualAttendance = this.attendees.length;
  }
  
  return this.save();
};

// Method to check if event is full
eventSchema.methods.isFull = function() {
  const goingCount = this.rsvps.filter(rsvp => rsvp.status === 'going').length;
  return goingCount >= this.maxCapacity;
};

// Method to check if registration is open
eventSchema.methods.isRegistrationOpen = function() {
  const now = new Date();
  
  if (!this.registrationRequired) return true;
  if (this.isFull()) return false;
  if (this.registrationDeadline && now > this.registrationDeadline) return false;
  
  return true;
};

module.exports = mongoose.model('Event', eventSchema);