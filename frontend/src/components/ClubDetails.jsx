import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, MapPin, Star, UserPlus, UserMinus, Settings, Award, Target, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { clubsAPI, eventsAPI } from '../services/api';

const ClubDetails = ({ club, onClose, onUpdate }) => {
  const [clubEvents, setClubEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const isJoined = club.members?.some(member => 
    typeof member === 'object' ? member._id === user?.id : member === user?.id
  );
  const isAdmin = club.admins?.some(admin => 
    typeof admin === 'object' ? admin._id === user?.id : admin === user?.id
  );

  useEffect(() => {
    fetchClubEvents();
  }, [club._id]);

  const fetchClubEvents = async () => {
    try {
      const response = await eventsAPI.getEventsByClub(club._id);
      setClubEvents(response.data);
    } catch (error) {
      console.error('Error fetching club events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    try {
      setJoinLoading(true);
      if (isJoined) {
        await clubsAPI.leaveClub(club._id);
        showSuccess(`You have left ${club.name}`, 'Club Left');
      } else {
        await clubsAPI.joinClub(club._id);
        showSuccess(`Welcome to ${club.name}!`, 'Club Joined');
      }
      onUpdate();
    } catch (error) {
      showError(error.response?.data?.message || 'Action failed', 'Error');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleRSVP = async (eventId, status) => {
    try {
      await eventsAPI.rsvpEvent(eventId, status);
      fetchClubEvents(); // Refresh events to update RSVP count
      showSuccess(`RSVP updated to ${status}`, 'Event RSVP');
    } catch (error) {
      showError('Failed to update RSVP', 'Error');
    }
  };

  // Get department info based on BIT club data
  const getDepartmentInfo = (clubName) => {
    const bitClubInfo = {
      'Elevate': { dept: 'Open to all students', focus: 'Public speaking, critical thinking, listening & retention' },
      'DEV-SOC': { dept: 'CSE/ISE, open to all developers', focus: 'Hackathons, coding championships, collaboration in tech' },
      'IRSC': { dept: 'Open to all, multi-disciplinary', focus: 'Road safety awareness, policy, law, technical & medical aspects' },
      'MLSA x SDI Club': { dept: 'CSE/ISE', focus: 'Coding culture, AI/ML, web dev, competitive programming, open source' },
      'ಸಂಸ್ಕೃತಿ (Samskruthi)': { dept: 'Cultural club, open to all', focus: 'Promoting Kannada language & culture' },
      'Rotaract Club of Bangalore BIT': { dept: 'College-wide, multidisciplinary', focus: 'Social service, professional service, extracurricular activities' },
      'E-Swachha Club': { dept: 'Environmental initiative, open to all', focus: 'Cleanliness, waste management, eco-consciousness' },
      'AIKYA': { dept: 'Social initiative, open to all', focus: 'Social leadership, volunteering in schools, environment, hygiene' },
      'NuFace': { dept: 'Environmental/Innovation based, open to all', focus: 'Sustainable technologies, green living, innovation' },
      'Robolution': { dept: 'ECE, CSE, Mech (technical)', focus: 'Robotics, IoT, AI, Arduino projects' },
      'TADS': { dept: 'Cultural, open to all', focus: 'Theatre, acting, script writing, stage production' },
      'Science Centre': { dept: 'Institution-wide (multi-disciplinary)', focus: 'Nurturing scientific thinking & innovation' },
      'MEDIA Club': { dept: 'Institution-level (all branches)', focus: 'Promotions, social/digital media presence' },
      'OS Code Club': { dept: 'CSE/ISE (tech-focused)', focus: 'Coding challenges, hackathons, workshops' },
      'NODE.ai': { dept: 'Institution-wide', focus: 'Blend of technical + cultural events' },
      'The Voice BIT': { dept: 'Institution-level', focus: 'Talks, campaigns, youth empowerment' },
      'LEO Club': { dept: 'Institution-level', focus: 'Leadership, social responsibility, talent development' },
      'ECSA': { dept: 'ECE (exclusive)', focus: 'Academic & co-curricular growth in ECE' },
      'YES!+ Club': { dept: 'Institution-wide (personality development)', focus: 'Job readiness, stress management, teamwork, decision-making' },
      'GDG': { dept: 'CSE/ISE, open to all', focus: 'Google technologies, workshops, hackathons' },
      'Vikasana Club': { dept: 'Institution-level (Wellbeing initiative)', focus: 'Mental health, wellbeing, mindfulness, counselling' },
      'Institution Innovation Council': { dept: 'Institution-level', focus: 'Startup ecosystem, innovation, entrepreneurship' },
      'IEDC': { dept: 'Institution-level (entrepreneurship)', focus: 'Incubation, product development, entrepreneurship' },
      'Robo Cell': { dept: 'ECE, CSE', focus: 'Robotics + AI projects (collaboration of Robo & AI clubs)' },
      'ECO Club': { dept: 'Institution-level', focus: 'Eco-friendly activities, cleanliness, sustainability' },
      'Under 25 BIT': { dept: 'Institution-level', focus: 'National student collective, community building, events' },
      'Diminished 7th': { dept: 'Cultural, open to all', focus: 'Music, performance, talent promotion' },
      'XKalibre': { dept: 'Institution-level, under Placement Cell', focus: 'Communication, soft skills, placement prep, debates' },
      'TEDx BIT Bangalore': { dept: 'Institution-level', focus: 'TED-style talks, idea sharing, community knowledge' },
      'Dance Club': { dept: 'Cultural, open to all', focus: 'Dance, performance, cultural events' },
      'BIT Sports Club': { dept: 'Institution-level (all sports)', focus: 'Inter-department & inter-college sports events' },
      'SAE INDIA – BIT Collegiate Club': { dept: 'Mechanical Engineering', focus: 'Design & build off-road vehicles (BAJA SAE)' },
      'IEEE Student Branch': { dept: 'EEE/ECE (with sub-branches like WIE, CAS)', focus: 'Technical activities, competitions, industrial expertise' }
    };
    
    return bitClubInfo[clubName] || { dept: 'Institution-wide', focus: club.description };
  };

  const clubInfo = getDepartmentInfo(club.name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-start rounded-t-xl">
          <div className="flex items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{club.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  {club.members?.length || 0} members
                </span>
                <span className="flex items-center gap-1">
                  <Building size={16} />
                  {clubInfo.dept}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {club.category}
                </span>
                {isJoined && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user?.role === 'student' && !isAdmin && (
              <button
                onClick={handleJoinLeave}
                disabled={joinLoading}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                  isJoined
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {joinLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    {isJoined ? <UserMinus size={16} /> : <UserPlus size={16} />}
                    {isJoined ? 'Leave Club' : 'Join Club'}
                  </>
                )}
              </button>
            )}
            
            {isAdmin && (
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Settings size={16} />
                Manage Club
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Club Focus & Description */}
          <div className="mb-8">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Club Focus</h3>
              </div>
              <p className="text-blue-700 text-sm leading-relaxed">{clubInfo.focus}</p>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-3">About {club.name}</h3>
            <p className="text-gray-600 leading-relaxed">{club.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{club.members?.length || 0}</div>
              <div className="text-sm text-blue-700">Members</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{clubEvents.length}</div>
              <div className="text-sm text-green-700">Events</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Settings className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{club.admins?.length || 0}</div>
              <div className="text-sm text-purple-700">Admins</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {new Date().getFullYear() - (new Date(club.createdAt).getFullYear() || 2020)}+
              </div>
              <div className="text-sm text-yellow-700">Years Active</div>
            </div>
          </div>

          {/* Department & Eligibility */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Department & Eligibility</h3>
            </div>
            <p className="text-gray-700 text-sm">{clubInfo.dept}</p>
          </div>

          {/* Events Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Events
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : clubEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clubEvents.map(event => (
                  <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-800 line-clamp-1">{event.title}</h4>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {event.rsvps?.length || 0} RSVPs
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 text-sm line-clamp-2">{event.description}</p>
                    <div className="flex flex-col gap-2 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{new Date(event.date).toLocaleDateString('en-IN')}</span>
                        <span className="ml-2">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {isJoined && new Date(event.date) > new Date() && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRSVP(event._id, 'going')}
                          className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Going
                        </button>
                        <button
                          onClick={() => handleRSVP(event._id, 'maybe')}
                          className="flex-1 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                        >
                          Maybe
                        </button>
                        <button
                          onClick={() => handleRSVP(event._id, 'not-going')}
                          className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          Can't Go
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium mb-1">No upcoming events</p>
                <p className="text-sm">Check back later for new events from {club.name}!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetails;