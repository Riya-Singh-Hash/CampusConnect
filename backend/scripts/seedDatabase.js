// backend/scripts/seedDatabase.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load .env correctly
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("🔑 Loaded MONGODB_URI:", process.env.MONGODB_URI ? "✅ Present" : "❌ Missing");

// Import models
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');


// Check for MONGODB_URI
if (!process.env.MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env file");
  process.exit(1);
}

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Sample users data
const sampleUsers = [
  {
    name: 'Super Admin',
    email: 'admin@bit.edu.in',
    password: 'admin123',
    role: 'super-admin',
    department: 'CSE',
    isActive: true
  },
  {
    name: 'DEV-SOC Admin',
    email: 'devsoc.admin@bit.edu.in',
    password: 'admin123',
    role: 'club-admin',
    studentId: 'BIT001',
    department: 'CSE',
    year: 4,
    isActive: true
  },
  {
    name: 'Robotics Admin',
    email: 'robotics.admin@bit.edu.in',
    password: 'admin123',
    role: 'club-admin',
    studentId: 'BIT002',
    department: 'ECE',
    year: 3,
    isActive: true
  },
  {
    name: 'John Student',
    email: 'john.student@bit.edu.in',
    password: 'student123',
    role: 'student',
    studentId: 'BIT003',
    department: 'CSE',
    year: 2,
    isActive: true
  },
  {
    name: 'Jane Student',
    email: 'jane.student@bit.edu.in',
    password: 'student123',
    role: 'student',
    studentId: 'BIT004',
    department: 'ECE',
    year: 3,
    isActive: true
  }
];

// Sample BIT clubs data
const sampleClubs = [
  {
    name: "DEV-SOC (Developer's Society)",
    description:
      "Developer Society focused on hackathons, coding championships, and collaboration in tech. We organize workshops, coding competitions, and mentor students in software development.",
    category: 'Technical',
    department: 'CSE/ISE (tech-focused)',
    focus: 'Hackathons, coding championships, collaboration in tech',
    contactInfo: {
      email: 'devsoc@bit.edu.in',
      phone: '+91-9876543210'
    },
    meetingSchedule: {
      day: 'Friday',
      time: '4:00 PM',
      location: 'Computer Lab 1',
      frequency: 'weekly'
    },
    maxMembers: 100,
    joinApprovalRequired: false,
    tags: ['coding', 'hackathon', 'programming', 'development'],
    isActive: true
  },
  {
    name: 'Robolution',
    description:
      'Robotics club focused on IoT, AI, and Arduino projects. We build robots, participate in competitions, and explore cutting-edge automation technologies.',
    category: 'Technical',
    department: 'ECE (exclusive)',
    focus: 'Robotics, IoT, AI, Arduino projects',
    contactInfo: {
      email: 'robolution@bit.edu.in',
      phone: '+91-9876543211'
    },
    meetingSchedule: {
      day: 'Saturday',
      time: '2:00 PM',
      location: 'Electronics Lab',
      frequency: 'weekly'
    },
    maxMembers: 50,
    joinApprovalRequired: true,
    tags: ['robotics', 'iot', 'arduino', 'automation'],
    isActive: true
  },
  {
    name: 'ಸಂಸ್ಕೃತಿ (Samskruthi)',
    description:
      'Cultural club dedicated to promoting Kannada language and culture. We organize cultural events, language workshops, and celebrate traditional festivals.',
    category: 'Cultural',
    department: 'Cultural club',
    focus: 'Promoting Kannada language & culture',
    contactInfo: {
      email: 'samskruthi@bit.edu.in'
    },
    meetingSchedule: {
      day: 'Thursday',
      time: '3:30 PM',
      location: 'Auditorium',
      frequency: 'weekly'
    },
    maxMembers: 80,
    joinApprovalRequired: false,
    tags: ['culture', 'kannada', 'tradition', 'festivals'],
    isActive: true
  },
  {
    name: 'TADS (The Arts and Dramatic Society)',
    description:
      'Theatre club focused on acting, script writing, and stage production. Join us to explore your dramatic talents and participate in college productions.',
    category: 'Cultural',
    department: 'Cultural club',
    focus: 'Theatre, acting, script writing, stage production',
    contactInfo: {
      email: 'tads@bit.edu.in'
    },
    meetingSchedule: {
      day: 'Wednesday',
      time: '5:00 PM',
      location: 'Drama Room',
      frequency: 'bi-weekly'
    },
    maxMembers: 40,
    joinApprovalRequired: false,
    tags: ['theatre', 'drama', 'acting', 'stage'],
    isActive: true
  },
  {
    name: 'E-Swachha Club',
    description:
      'Environmental club focused on cleanliness, waste management, and eco-consciousness. Join us in making BIT a greener and cleaner campus.',
    category: 'Environmental',
    department: 'Environmental initiative',
    focus: 'Cleanliness, waste management, eco-consciousness',
    contactInfo: {
      email: 'eswachha@bit.edu.in'
    },
    meetingSchedule: {
      day: 'Sunday',
      time: '10:00 AM',
      location: 'Campus Garden',
      frequency: 'weekly'
    },
    maxMembers: 60,
    joinApprovalRequired: false,
    tags: ['environment', 'cleanliness', 'sustainability', 'green'],
    isActive: true
  }
];

// Sample events data
const sampleEvents = [
  {
    title: 'React & Node.js Workshop',
    description:
      'Learn to build full-stack web applications using React.js for frontend and Node.js for backend. Perfect for beginners and intermediate developers.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: '10:00',
    endTime: '16:00',
    location: 'Computer Lab 1, Main Building',
    venue: {
      type: 'physical',
      building: 'Main Building',
      room: 'Computer Lab 1'
    },
    category: 'workshop',
    type: 'public',
    maxCapacity: 50,
    registrationRequired: true,
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    prerequisites: ['Basic JavaScript knowledge', 'Laptop with Node.js installed'],
    tags: ['react', 'nodejs', 'javascript', 'fullstack'],
    status: 'published'
  },
  {
    title: 'Annual Robotics Competition',
    description:
      'Showcase your robotics skills in our annual competition. Build robots to complete various challenges and win exciting prizes.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    time: '09:00',
    endTime: '17:00',
    location: 'Main Auditorium',
    venue: {
      type: 'physical',
      building: 'Main Building',
      room: 'Auditorium'
    },
    category: 'competition',
    type: 'public',
    maxCapacity: 100,
    registrationRequired: true,
    registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    fee: {
      amount: 200,
      currency: 'INR',
      description: 'Registration and kit fee'
    },
    prerequisites: ['Team of 2-4 members', 'Basic robotics knowledge'],
    tags: ['robotics', 'competition', 'innovation'],
    status: 'published'
  }
];

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Club.deleteMany({});
    await Event.deleteMany({});

    console.log('👤 Creating users...');
    const createdUsers = [];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    console.log('🏛️  Creating clubs...');
    const createdClubs = [];

    for (let i = 0; i < sampleClubs.length; i++) {
      const clubData = sampleClubs[i];
      const adminUser = createdUsers[i + 1] || createdUsers[1];

      const club = new Club({
        ...clubData,
        admins: [
          {
            user: adminUser._id,
            role: 'president',
            appointedAt: new Date()
          }
        ],
        members: [
          {
            user: adminUser._id,
            status: 'active',
            role: 'coordinator',
            joinedAt: new Date()
          }
        ]
      });

      await club.save();
      createdClubs.push(club);

      await User.findByIdAndUpdate(adminUser._id, {
        $push: {
          adminClubs: club._id,
          joinedClubs: {
            club: club._id,
            status: 'active',
            joinedAt: new Date()
          }
        }
      });

      console.log(`✅ Created club: ${club.name} (Admin: ${adminUser.name})`);
    }

    console.log('📅 Creating events...');

    for (let i = 0; i < sampleEvents.length; i++) {
      const eventData = sampleEvents[i];
      const club = createdClubs[i];
      const creator = createdUsers[i + 1];

      const event = new Event({
        ...eventData,
        club: club._id,
        createdBy: creator._id
      });

      await event.save();

      await Club.findByIdAndUpdate(club._id, {
        $push: { events: event._id },
        $inc: { 'stats.totalEvents': 1 }
      });

      console.log(`✅ Created event: ${event.title} for ${club.name}`);
    }

    console.log('👥 Adding sample members...');
    const studentUsers = createdUsers.filter((user) => user.role === 'student');

    for (const club of createdClubs.slice(0, 3)) {
      for (const student of studentUsers) {
        await club.addMember(student._id, 'member');
        await User.findByIdAndUpdate(student._id, {
          $push: {
            joinedClubs: {
              club: club._id,
              status: 'active',
              joinedAt: new Date()
            }
          }
        });
      }
      console.log(`✅ Added ${studentUsers.length} members to ${club.name}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👤 Users: ${createdUsers.length}`);
    console.log(`   🏛️  Clubs: ${createdClubs.length}`);
    console.log(`   📅 Events: ${sampleEvents.length}`);

    console.log('\n🔐 Login Credentials:');
    console.log('   Super Admin: admin@bit.edu.in / admin123');
    console.log('   Club Admin: devsoc.admin@bit.edu.in / admin123');
    console.log('   Student: john.student@bit.edu.in / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
