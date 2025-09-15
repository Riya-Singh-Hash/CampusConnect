const express = require('express');
const Club = require('../models/Club');
const User = require('../models/User');
const Event = require('../models/Event');
const { auth, authorize, clubAdmin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      department, 
      search, 
      page = 1, 
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const clubs = await Club.find(query)
      .populate('members.user', 'name email')
      .populate('admins.user', 'name email')
      .populate('events')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalClubs = await Club.countDocuments(query);

    res.json({
      success: true,
      count: clubs.length,
      totalPages: Math.ceil(totalClubs / limit),
      currentPage: parseInt(page),
      totalClubs,
      data: clubs.map(club => ({
        _id: club._id,
        name: club.name,
        description: club.description,
        category: club.category,
        department: club.department,
        focus: club.focus,
        logo: club.logo,
        members: club.members.filter(m => m.status === 'active'),
        admins: club.admins,
        events: club.events,
        activeMembersCount: club.activeMembersCount,
        activeEventsCount: club.activeEventsCount,
        establishedDate: club.establishedDate,
        tags: club.tags,
        createdAt: club.createdAt
      }))
    });
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clubs'
    });
  }
});

// @desc    Get single club by ID
// @route   GET /api/clubs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('members.user', 'name email department year profilePicture')
      .populate('admins.user', 'name email department profilePicture')
      .populate({
        path: 'events',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Increment view count (optional)
    // club.stats.views = (club.stats.views || 0) + 1;
    // await club.save();

    res.json({
      success: true,
      data: {
        ...club.toObject(),
        activeMembersCount: club.activeMembersCount,
        activeEventsCount: club.activeEventsCount,
        clubAge: club.clubAge
      }
    });
  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching club'
    });
  }
});

// @desc    Create new club
// @route   POST /api/clubs
// @access  Private (club-admin, super-admin)
router.post('/', auth, authorize('club-admin', 'super-admin'), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      department,
      focus,
      contactInfo,
      meetingSchedule,
      maxMembers,
      joinApprovalRequired,
      tags
    } = req.body;

    // Check if club name already exists
    const existingClub = await Club.findOne({ 
      name: { $regex: new RegExp('^' + name + '$', 'i') } 
    });

    if (existingClub) {
      return res.status(400).json({
        success: false,
        message: 'Club with this name already exists'
      });
    }

    // Create club
    const club = new Club({
      name: name.trim(),
      description: description.trim(),
      category,
      department,
      focus: focus.trim(),
      contactInfo,
      meetingSchedule,
      maxMembers,
      joinApprovalRequired,
      tags,
      admins: [{
        user: req.user._id,
        role: 'president'
      }]
    });

    await club.save();

    // Add club to user's admin clubs
    await User.findByIdAndUpdate(req.user._id, {
      $push: { adminClubs: club._id }
    });

    const populatedClub = await Club.findById(club._id)
      .populate('admins.user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      data: populatedClub
    });
  } catch (error) {
    console.error('Create club error:', error);
    
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
      message: 'Server error creating club'
    });
  }
});

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private (club admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is admin of this club
    if (!club.isAdmin(req.user._id) && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this club'
      });
    }

    const {
      name,
      description,
      category,
      department,
      focus,
      contactInfo,
      meetingSchedule,
      maxMembers,
      joinApprovalRequired,
      tags,
      rules
    } = req.body;

    // Update club
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim(),
        description: description?.trim(),
        category,
        department,
        focus: focus?.trim(),
        contactInfo,
        meetingSchedule,
        maxMembers,
        joinApprovalRequired,
        tags,
        rules
      },
      { new: true, runValidators: true }
    ).populate('members.user', 'name email')
     .populate('admins.user', 'name email');

    res.json({
      success: true,
      message: 'Club updated successfully',
      data: updatedClub
    });
  } catch (error) {
    console.error('Update club error:', error);
    
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
      message: 'Server error updating club'
    });
  }
});

// @desc    Join club
// @route   POST /api/clubs/:id/join
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if already a member
    if (club.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this club'
      });
    }

    // Check if club is full
    if (club.activeMembersCount >= club.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Club has reached maximum member capacity'
      });
    }

    if (club.joinApprovalRequired) {
      // Add to pending requests
      const existingRequest = club.pendingRequests.find(req => 
        req.user.toString() === req.user._id.toString()
      );

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Join request already pending approval'
        });
      }

      club.pendingRequests.push({
        user: req.user._id,
        message: req.body.message || ''
      });

      await club.save();

      res.json({
        success: true,
        message: 'Join request submitted successfully. Awaiting admin approval.'
      });
    } else {
      // Direct join
      await club.addMember(req.user._id);

      // Add club to user's joined clubs
      await User.findByIdAndUpdate(req.user._id, {
        $push: { 
          joinedClubs: {
            club: club._id,
            status: 'active'
          }
        }
      });

      res.json({
        success: true,
        message: 'Successfully joined the club'
      });
    }
  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining club'
    });
  }
});

// @desc    Leave club
// @route   POST /api/clubs/:id/leave
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is a member
    if (!club.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this club'
      });
    }

    // Remove from club members
    await club.removeMember(req.user._id);

    // Remove club from user's joined clubs
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedClubs: { club: club._id } }
    });

    res.json({
      success: true,
      message: 'Successfully left the club'
    });
  } catch (error) {
    console.error('Leave club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error leaving club'
    });
  }
});

// @desc    Get club members
// @route   GET /api/clubs/:id/members
// @access  Private (club members only)
router.get('/:id/members', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('members.user', 'name email department year profilePicture bio')
      .populate('admins.user', 'name email department year profilePicture');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is member or admin
    if (!club.isMember(req.user._id) && !club.isAdmin(req.user._id) && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only club members can view member list.'
      });
    }

    const activeMembers = club.members.filter(member => member.status === 'active');

    res.json({
      success: true,
      data: {
        members: activeMembers,
        admins: club.admins,
        totalMembers: activeMembers.length,
        totalAdmins: club.admins.length
      }
    });
  } catch (error) {
    console.error('Get club members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching club members'
    });
  }
});

// @desc    Get club events
// @route   GET /api/clubs/:id/events
// @access  Public
router.get('/:id/events', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const events = await Event.find({ 
      club: req.params.id,
      status: { $in: ['published', 'ongoing'] }
    })
    .populate('createdBy', 'name email')
    .sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get club events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching club events'
    });
  }
});

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private (super-admin only)
router.delete('/:id', auth, authorize('super-admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Remove club from all users' joined clubs and admin clubs
    await User.updateMany(
      {},
      {
        $pull: {
          joinedClubs: { club: club._id },
          adminClubs: club._id
        }
      }
    );

    // Delete all club events
    await Event.deleteMany({ club: club._id });

    // Delete club
    await club.deleteOne();

    res.json({
      success: true,
      message: 'Club and related data deleted successfully'
    });
  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting club'
    });
  }
});

module.exports = router;