const express = require('express');
const Event = require('../models/Event');
const Club = require('../models/Club');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all events
// @route   GET /api/events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      club,
      category,
      status = 'published',
      upcoming = 'true',
      search,
      page = 1,
      limit = 12,
      sortBy = 'date',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    let query = {};

    if (club) {
      query.club = club;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const events = await Event.find(query)
      .populate('club', 'name logo category')
      .populate('createdBy', 'name email')
      .populate('rsvps.user', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await Event.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      totalPages: Math.ceil(totalEvents / limit),
      currentPage: parseInt(page),
      totalEvents,
      data: events.map(event => ({
        ...event.toObject(),
        rsvpCounts: event.rsvpCounts,
        availableSpots: event.availableSpots,
        eventStatus: event.eventStatus,
        isRegistrationOpen: event.isRegistrationOpen(),
        isFull: event.isFull()
      }))
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching events'
    });
  }
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name logo category description contactInfo')
      .populate('createdBy', 'name email')
      .populate('rsvps.user', 'name email profilePicture')
      .populate('attendees.user', 'name email')
      .populate('speakers.user', 'name email profilePicture');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment view count
    event.stats.views = (event.stats.views || 0) + 1;
    await event.save();

    res.json({
      success: true,
      data: {
        ...event.toObject(),
        rsvpCounts: event.rsvpCounts,
        availableSpots: event.availableSpots,
        eventStatus: event.eventStatus,
        isRegistrationOpen: event.isRegistrationOpen(),
        isFull: event.isFull(),
        duration: event.duration
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching event'
    });
  }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private (club admin only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      endTime,
      location,
      venue,
      clubId,
      category,
      type,
      maxCapacity,
      registrationRequired,
      registrationDeadline,
      fee,
      prerequisites,
      agenda,
      speakers,
      tags,
      poster
    } = req.body;

    // Validate required fields
    if (!title || !description || !date || !time || !location || !clubId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, date, time, location, clubId'
      });
    }

    // Check if club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is admin of the club
    if (!club.isAdmin(req.user._id) && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not an admin of this club'
      });
    }

    // Validate date is in future
    const eventDate = new Date(date + 'T' + time);
    if (eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event date and time must be in the future'
      });
    }

    // Create event
    const event = new Event({
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      time,
      endTime,
      location: location.trim(),
      venue,
      club: clubId,
      createdBy: req.user._id,
      category: category || 'other',
      type: type || 'members-only',
      maxCapacity: maxCapacity || 100,
      registrationRequired: registrationRequired || false,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      fee,
      prerequisites: prerequisites || [],
      agenda: agenda || [],
      speakers: speakers || [],
      tags: tags || [],
      poster,
      status: 'published'
    });

    await event.save();

    // Add event to club's events array
    await Club.findByIdAndUpdate(clubId, {
      $push: { events: event._id },
      $inc: { 'stats.totalEvents': 1 }
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('club', 'name logo')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        ...populatedEvent.toObject(),
        rsvpCounts: populatedEvent.rsvpCounts,
        availableSpots: populatedEvent.availableSpots
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating event'
    });
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (event creator or club admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is creator, club admin, or super admin
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isClubAdmin = event.club.isAdmin(req.user._id);
    const isSuperAdmin = req.user.role === 'super-admin';

    if (!isCreator && !isClubAdmin && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not authorized to update this event'
      });
    }

    const {
      title,
      description,
      date,
      time,
      endTime,
      location,
      venue,
      category,
      type,
      maxCapacity,
      registrationRequired,
      registrationDeadline,
      fee,
      prerequisites,
      agenda,
      speakers,
      tags,
      poster,
      status
    } = req.body;

    // Validate date is in future (if updating)
    if (date && time) {
      const eventDate = new Date(date + 'T' + time);
      if (eventDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Event date and time must be in the future'
        });
      }
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: title?.trim(),
        description: description?.trim(),
        date: date ? new Date(date) : event.date,
        time: time || event.time,
        endTime,
        location: location?.trim(),
        venue,
        category,
        type,
        maxCapacity,
        registrationRequired,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        fee,
        prerequisites,
        agenda,
        speakers,
        tags,
        poster,
        status
      },
      { new: true, runValidators: true }
    )
      .populate('club', 'name logo')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        ...updatedEvent.toObject(),
        rsvpCounts: updatedEvent.rsvpCounts,
        availableSpots: updatedEvent.availableSpots
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating event'
    });
  }
});

// @desc    RSVP to event
// @route   POST /api/events/:id/rsvp
// @access  Private
router.post('/:id/rsvp', auth, async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!['going', 'maybe', 'not-going'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid RSVP status. Must be: going, maybe, or not-going'
      });
    }

    const event = await Event.findById(req.params.id).populate('club');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot RSVP to past events'
      });
    }

    // Check if registration is open
    if (!event.isRegistrationOpen()) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed for this event'
      });
    }

    // For members-only events, check if user is member
    if (event.type === 'members-only' && !event.club.isMember(req.user._id) && !event.club.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'This event is only for club members'
      });
    }

    // Add/Update RSVP
    await event.addRSVP(req.user._id, status, note);

    // Update user's event RSVPs
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { eventRSVPs: { event: event._id } }
    });

    if (status !== 'not-going') {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { 
          eventRSVPs: {
            event: event._id,
            status: status
          }
        }
      });
    }

    const updatedEvent = await Event.findById(event._id)
      .populate('rsvps.user', 'name');

    res.json({
      success: true,
      message: `RSVP updated to "${status}" successfully`,
      data: {
        rsvpCounts: updatedEvent.rsvpCounts,
        availableSpots: updatedEvent.availableSpots,
        userRSVP: updatedEvent.getUserRSVP(req.user._id)
      }
    });
  } catch (error) {
    console.error('RSVP event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating RSVP'
    });
  }
});

// @desc    Get event RSVPs
// @route   GET /api/events/:id/rsvps
// @access  Private (club admin only)
router.get('/:id/rsvps', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club')
      .populate('rsvps.user', 'name email department year profilePicture');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is club admin
    if (!event.club.isAdmin(req.user._id) && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only club admins can view RSVPs'
      });
    }

    const rsvpsByStatus = {
      going: event.rsvps.filter(rsvp => rsvp.status === 'going'),
      maybe: event.rsvps.filter(rsvp => rsvp.status === 'maybe'),
      notGoing: event.rsvps.filter(rsvp => rsvp.status === 'not-going')
    };

    res.json({
      success: true,
      data: {
        rsvpCounts: event.rsvpCounts,
        rsvpsByStatus,
        totalRSVPs: event.rsvps.length
      }
    });
  } catch (error) {
    console.error('Get event RSVPs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching RSVPs'
    });
  }
});

// @desc    Check in attendee
// @route   POST /api/events/:id/checkin
// @access  Private (club admin only)
router.post('/:id/checkin', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required for check-in'
      });
    }

    const event = await Event.findById(req.params.id).populate('club');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is club admin
    if (!event.club.isAdmin(req.user._id) && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only club admins can check in attendees'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check in attendee
    await event.checkInAttendee(userId, req.user._id);

    res.json({
      success: true,
      message: `${user.name} checked in successfully`,
      data: {
        actualAttendance: event.stats.actualAttendance
      }
    });
  } catch (error) {
    console.error('Check in attendee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking in attendee'
    });
  }
});

// @desc    Add feedback to event
// @route   POST /api/events/:id/feedback
// @access  Private
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, comment, isAnonymous } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is completed
    if (new Date(event.date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot provide feedback for future events'
      });
    }

    // Check if user already provided feedback
    const existingFeedback = event.feedback.find(fb => 
      fb.user.toString() === req.user._id.toString()
    );

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already provided feedback for this event'
      });
    }

    // Add feedback
    event.feedback.push({
      user: req.user._id,
      rating: parseInt(rating),
      comment: comment?.trim() || '',
      isAnonymous: isAnonymous || false
    });

    await event.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        averageRating: event.stats.averageRating,
        totalFeedback: event.feedback.length
      }
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting feedback'
    });
  }
});

// @desc    Get event feedback
// @route   GET /api/events/:id/feedback
// @access  Private (club admin only)
router.get('/:id/feedback', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club')
      .populate('feedback.user', 'name email profilePicture');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is club admin
    if (!event.club.isAdmin(req.user._id) && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only club admins can view feedback'
      });
    }

    // Filter anonymous feedback
    const feedback = event.feedback.map(fb => ({
      _id: fb._id,
      rating: fb.rating,
      comment: fb.comment,
      submittedAt: fb.submittedAt,
      user: fb.isAnonymous ? null : fb.user
    }));

    res.json({
      success: true,
      data: {
        feedback,
        averageRating: event.stats.averageRating,
        totalFeedback: event.feedback.length,
        ratingDistribution: {
          5: event.feedback.filter(fb => fb.rating === 5).length,
          4: event.feedback.filter(fb => fb.rating === 4).length,
          3: event.feedback.filter(fb => fb.rating === 3).length,
          2: event.feedback.filter(fb => fb.rating === 2).length,
          1: event.feedback.filter(fb => fb.rating === 1).length
        }
      }
    });
  } catch (error) {
    console.error('Get event feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feedback'
    });
  }
});

// @desc    Get events by club
// @route   GET /api/events/club/:clubId
// @access  Public
router.get('/club/:clubId', async (req, res) => {
  try {
    const { upcoming = 'true', limit = 10 } = req.query;

    let query = { 
      club: req.params.clubId,
      status: 'published'
    };

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: events.length,
      data: events.map(event => ({
        ...event.toObject(),
        rsvpCounts: event.rsvpCounts,
        availableSpots: event.availableSpots
      }))
    });
  } catch (error) {
    console.error('Get club events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching club events'
    });
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (event creator, club admin, or super admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is creator, club admin, or super admin
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isClubAdmin = event.club.isAdmin(req.user._id);
    const isSuperAdmin = req.user.role === 'super-admin';

    if (!isCreator && !isClubAdmin && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not authorized to delete this event'
      });
    }

    // Remove event from club's events array
    await Club.findByIdAndUpdate(event.club._id, {
      $pull: { events: event._id },
      $inc: { 'stats.totalEvents': -1 }
    });

    // Remove event from users' RSVP lists
    await User.updateMany(
      {},
      { $pull: { eventRSVPs: { event: event._id } } }
    );

    // Delete event
    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting event'
    });
  }
});

module.exports = router;