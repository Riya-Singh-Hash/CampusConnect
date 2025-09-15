import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Users } from 'lucide-react';
import Header from './Header';
import ClubCard from './ClubCard';
import CreateClub from './CreateClub';
import CreateEvent from './CreateEvent';
import { useAuth } from '../context/AuthContext';
import { clubsAPI, eventsAPI } from '../services/api';

const Dashboard = () => {
  // Initialize all state with proper default values
  const [clubs, setClubs] = useState([]); // Initialize as empty array
  const [events, setEvents] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [activeTab, setActiveTab] = useState('clubs');

  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching clubs and events...');
      
      // Fetch clubs and events separately with proper error handling
      let clubsData = [];
      let eventsData = [];
      
      try {
        const clubsResponse = await clubsAPI.getAllClubs();
        console.log('✅ Clubs response:', clubsResponse);
        clubsData = clubsResponse?.data?.data || clubsResponse?.data || [];
      } catch (clubError) {
        console.error('❌ Error fetching clubs:', clubError);
        clubsData = []; // Fallback to empty array
      }
      
      try {
        const eventsResponse = await eventsAPI.getAllEvents();
        console.log('✅ Events response:', eventsResponse);
        eventsData = eventsResponse?.data?.data || eventsResponse?.data || [];
      } catch (eventError) {
        console.error('❌ Error fetching events:', eventError);
        eventsData = []; // Fallback to empty array
      }
      
      // Ensure data is arrays
      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      
      console.log('📊 Final data set - Clubs:', clubsData.length, 'Events:', eventsData.length);
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError('Failed to load data. Please try again.');
      // Set fallback empty arrays
      setClubs([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe filtering with fallback
  const filteredClubs = (clubs || []).filter(club => {
    if (!club) return false; // Skip null/undefined clubs
    
    const matchesSearch = (club.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (club.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Safe category extraction
  const categories = ['all', ...new Set((clubs || []).map(club => club?.category).filter(Boolean))];

  const canCreateClub = user?.role === 'club-admin' || user?.role === 'super-admin';
  const canCreateEvent = user?.role === 'club-admin' || user?.role === 'super-admin';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-6">
        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            Debug: Clubs: {clubs?.length || 0}, Events: {events?.length || 0}, User: {user?.role}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('clubs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'clubs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  Clubs ({clubs?.length || 0})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  Events ({events?.length || 0})
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Category Filter for Clubs */}
            {activeTab === 'clubs' && (
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {canCreateClub && activeTab === 'clubs' && (
              <button
                onClick={() => setShowCreateClub(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Create Club
              </button>
            )}
            {canCreateEvent && activeTab === 'events' && (
              <button
                onClick={() => setShowCreateEvent(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Create Event
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'clubs' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map(club => (
              <ClubCard key={club._id} club={club} onUpdate={fetchData} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(events || []).map(event => (
              <div key={event._id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {event.time}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Club:</strong> {event.club?.name}</p>
                  <p><strong>RSVPs:</strong> {event.rsvps?.length || 0}</p>
                </div>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  RSVP
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'clubs' && filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No clubs available yet.'
              }
            </p>
          </div>
        )}

        {activeTab === 'events' && (!events || events.length === 0) && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">Check back later for upcoming events!</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateClub && (
        <CreateClub 
          onClose={() => setShowCreateClub(false)} 
          onSuccess={fetchData}
        />
      )}
      
      {showCreateEvent && (
        <CreateEvent 
          onClose={() => setShowCreateEvent(false)} 
          onSuccess={fetchData}
          clubs={clubs.filter(club => club.admins?.some(admin => admin._id === user?.id) || [])}
        />
      )}
    </div>
  );
};

export default Dashboard;