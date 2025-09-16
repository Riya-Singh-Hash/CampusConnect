# 🏛️ CampusConnect

A comprehensive full-stack web application for managing college clubs, events, and student participation at Bangalore Institute of Technology (BIT). Built with modern web technologies to streamline club activities and enhance student engagement.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![MongoDB](https://img.shields.io/badge/mongodb-latest-green)

## 🌟 Features

### 👤 **User Management**
- **Multi-role Authentication** (Student, Club Admin, Super Admin)
- **JWT-based Security** with password hashing
- **Profile Management** with department and year tracking
- **Role-based Access Control** for different user types

### 🏛️ **Club Management**
- **Club Creation & Administration** with detailed profiles
- **Member Management** (join/leave clubs, approval system)
- **Club Categories** based on actual BIT clubs
- **Admin Dashboard** for club oversight
- **Club Statistics** and analytics

### 📅 **Event Management**
- **Event Creation** with comprehensive details
- **RSVP System** (Going/Maybe/Not Going)
- **Event Categories** (Workshop, Competition, Meeting, etc.)

### 🎨 **User Interface**
- **Responsive Design** for all devices
- **Modern UI** with Tailwind CSS
- **Real-time Notifications** system
- **Search & Filter** functionality
- **Interactive Dashboards** for different user roles

## 🛠️ Tech Stack

### **Frontend**
- **React.js** - Component-based UI library
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **Context API** - State management
- **Lucide React** - Modern icon library

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL document database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Helmet.js** - Security middleware

### **Security & Performance**
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API abuse protection
- **Input Validation** - Data sanitization
- **Error Handling** - Comprehensive error management

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (Atlas or Local)
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Riya-Singh-Hash/club-management-system.git
   cd club-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   
   # Start backend server
   npm run dev
   ```

3. **Frontend Setup** (New terminal)
   ```bash
   cd frontend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with API URL
   
   # Start frontend server
   npm run dev
   ```

4. **Seed Database** (Optional)
   ```bash
   cd backend
   node scripts/seedDatabase.js
   ```

### **Access the Application**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## 📊 Project Structure

```
bit-club-management/
├── frontend/                  # React.js Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # Context providers
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utility functions
│   │   └── styles/           # CSS files
│   ├── public/               # Static assets
│   └── package.json
│
├── backend/                   # Node.js Backend
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Club.js
│   │   └── Event.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── clubs.js
│   │   └── events.js
│   ├── middleware/           # Custom middleware
│   ├── config/               # Configuration files
│   ├── scripts/              # Database scripts
│   └── server.js             # Main server file
│
└── README.md
```

## 🎯 API Endpoints

### **Authentication**
```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # User login
GET    /api/auth/me           # Get current user
PUT    /api/auth/profile      # Update profile
PUT    /api/auth/password     # Change password
```

### **Clubs**
```
GET    /api/clubs             # Get all clubs
GET    /api/clubs/:id         # Get single club
POST   /api/clubs             # Create club (admin)
PUT    /api/clubs/:id         # Update club (admin)
POST   /api/clubs/:id/join    # Join club
POST   /api/clubs/:id/leave   # Leave club
GET    /api/clubs/:id/members # Get club members
```

### **Events**
```
GET    /api/events            # Get all events
GET    /api/events/:id        # Get single event
POST   /api/events            # Create event (admin)
PUT    /api/events/:id        # Update event (admin)
POST   /api/events/:id/rsvp   # RSVP to event
GET    /api/events/:id/rsvps  # Get event RSVPs (admin)
POST   /api/events/:id/feedback # Submit feedback
```

## 👥 User Roles & Permissions

### **🎓 Student**
- Browse and search clubs
- Join/leave clubs
- View club details and events
- RSVP to events
- Submit event feedback

### **🛡️ Club Admin**
- All student permissions
- Create and manage clubs
- Create and manage events
- View member lists and RSVPs
- Approve club join requests
- Access club analytics

## 🗃️ Database Schema

### **User Model**
- Authentication & profile data
- Club memberships & admin roles
- Event RSVPs & preferences

### **Club Model**
- Club information & settings
- Member & admin management
- Event associations & statistics

### **Event Model**
- Event details & scheduling
- RSVP & attendance tracking
- Feedback & rating system

## 🔐 Environment Variables

### **Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clubmanagement
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ClubHub
```

## 🧪 Testing

### **API Testing**
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@bit.edu.in","password":"test123","role":"student"}'

# Get all clubs
curl http://localhost:5000/api/clubs
```

### **Sample Credentials** (After seeding)
```
Super Admin: admin@bit.edu.in / admin123
Club Admin:  devsoc.admin@bit.edu.in / admin123
Student:     john.student@bit.edu.in / student123
```

## 🏗️ Build & Deployment

### **Production Build**
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
NODE_ENV=production npm start
```

### **Deployment Options**
- **Frontend:** Vercel, Netlify, AWS S3
- **Backend:** Railway, Render, Heroku, AWS EC2
- **Database:** MongoDB Atlas, AWS DocumentDB

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

## 📞 Contact & Support

- **Developer:** Riya Singh
- **Email:** riyasingh979me@gmail.com

## 🔮 Future Enhancements

- [ ] **Mobile App** (React Native)
- [ ] **Real-time Chat** system
- [ ] **Email Notifications** for events
- [ ] **Calendar Integration** (Google Calendar)
- [ ] **Payment System** for paid events
- [ ] **Analytics Dashboard** with charts
- [ ] **Multi-language Support**
- [ ] **Push Notifications**

---

---

*Last Updated: January 2025*
