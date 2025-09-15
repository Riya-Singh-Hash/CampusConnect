import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Info } from 'lucide-react';
import { eventsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const CreateEvent = ({ onClose, onSuccess, clubs = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    clubId: clubs[0]?._id || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Event title is required');
      return false;
    }
    if (formData.title.length < 3) {
      setError('Event title must be at least 3 characters');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Event description is required');
      return false;
    }
    if (formData.description.length < 10) {
      setError('Event description must be at least 10 characters');
      return false;
    }
    if (!formData.date) {
      setError('Event date is required');
      return false;
    }
    if (!formData.time) {
      setError('Event time is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Event location is required');
      return false;
    }
    if (!formData.clubId) {
      setError('Please select a club');
      return false;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.date + 'T' + formData.time);
    const now = new Date();
    if (selectedDate <= now) {
      setError('Event date and time must be in the future');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await eventsAPI.createEvent(formData);
      
      const clubName = clubs.find(club => club._id === formData.clubId)?.name || 'Club';
      showSuccess(`${formData.title} has been created successfully!`, `${clubName} Event Created`);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create event';
      setError(errorMessage);
      showError(errorMessage, 'Event Creation Failed');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleData = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sampleDate = tomorrow.toISOString().split('T')[0];

    const sampleEvent = {
      title: 'React Workshop - Build Your First App',
      description: 'Join us for an intensive React workshop where you\'ll learn the fundamentals of React and build your first web application. Perfect for beginners! We\'ll cover components, state management, and modern React hooks.',
      date: sampleDate,
      time: '14:00',
      location: 'Computer Lab 1, Main Building',
      clubId: formData.clubId
    };
    setFormData(sampleEvent);
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  
  // Get current time in HH:MM format
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  
  // Check if selected date is today
  const isToday = formData.date === today;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Create New Event</h2>
            <p className="text-gray-600 text-sm mt-1">Organize an exciting event for your club members</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Club Selection Warning */}
        {clubs.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm flex items-center gap-2">
            <Info size={16} />
            You need to be an admin of at least one club to create events.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <Info size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., React Workshop, Annual Tech Fest, Code Competition"
              required
            />
          </div>

          {/* Club Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizing Club *
            </label>
            <select
              name="clubId"
              value={formData.clubId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={clubs.length === 0}
            >
              {clubs.length === 0 ? (
                <option value="">No clubs available</option>
              ) : (
                clubs.map(club => (
                  <option key={club._id} value={club._id}>{club.name}</option>
                ))
              )}
            </select>
            {clubs.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                You must be an admin of a club to create events
              </p>
            )}
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Calendar size={16} />
                Event Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={today}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Clock size={16} />
                Event Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                min={isToday ? currentTime : undefined}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {isToday && (
                <p className="text-xs text-gray-500 mt-1">
                  Time must be later than current time for today's events
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <MapPin size={16} />
              Event Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Auditorium, Computer Lab, Online (Zoom), Conference Hall"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Provide a detailed description of your event. Include what attendees will learn, any prerequisites, what to bring, agenda, etc."
              required
            />
            <div className="text-xs text-gray-500 mt-1 flex justify-between">
              <span>Minimum 10 characters required</span>
              <span>{formData.description.length}/1000</span>
            </div>
          </div>

          {/* Sample Data Button */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-blue-800">Need inspiration?</h4>
                <p className="text-xs text-blue-600">Fill with sample event data to get started</p>
              </div>
              <button
                type="button"
                onClick={fillSampleData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                disabled={clubs.length === 0}
              >
                Fill Sample
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || clubs.length === 0}
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;