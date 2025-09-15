import React, { useState } from 'react';
import { X, Info, Building, Target } from 'lucide-react';
import { clubsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const CreateClub = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Technical',
    department: 'Institution-wide',
    focus: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useNotification();

  // BIT-specific categories based on the club data
  const bitCategories = [
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
  ];

  // BIT-specific departments
  const bitDepartments = [
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
  ];

  // Sample focuses based on existing BIT clubs
  const sampleFocuses = {
    'Technical': [
      'Hackathons, coding championships, collaboration in tech',
      'AI/ML, web dev, competitive programming, open source',
      'Robotics, IoT, AI, Arduino projects',
      'Google technologies, workshops, hackathons',
      'Technical activities, competitions, industrial expertise'
    ],
    'Cultural': [
      'Theatre, acting, script writing, stage production',
      'Music, performance, talent promotion',
      'Dance, performance, cultural events',
      'Promoting regional language & culture'
    ],
    'Social Service': [
      'Social service, professional service, extracurricular activities',
      'Social leadership, volunteering in schools, environment, hygiene',
      'Leadership, social responsibility, talent development'
    ],
    'Environmental': [
      'Cleanliness, waste management, eco-consciousness',
      'Sustainable technologies, green living, innovation',
      'Eco-friendly activities, cleanliness, sustainability'
    ],
    'Innovation & Entrepreneurship': [
      'Startup ecosystem, innovation, entrepreneurship',
      'Incubation, product development, entrepreneurship'
    ],
    'Personality Development': [
      'Public speaking, critical thinking, listening & retention',
      'Job readiness, stress management, teamwork, decision-making',
      'Communication, soft skills, placement prep, debates'
    ]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    
    // Auto-suggest focus based on category
    if (name === 'category' && sampleFocuses[value] && !formData.focus) {
      const randomFocus = sampleFocuses[value][Math.floor(Math.random() * sampleFocuses[value].length)];
      setFormData(prev => ({ ...prev, focus: randomFocus }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.name.length < 3) {
      setError('Club name must be at least 3 characters long');
      return;
    }
    
    if (formData.description.length < 20) {
      setError('Description must be at least 20 characters long');
      return;
    }

    if (formData.focus.length < 10) {
      setError('Focus description must be at least 10 characters long');
      return;
    }

    try {
      setLoading(true);
      await clubsAPI.createClub(formData);
      showSuccess(`${formData.name} has been created successfully!`, 'Club Created');
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create club';
      setError(errorMessage);
      showError(errorMessage, 'Club Creation Failed');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleData = () => {
    const sampleClub = {
      name: 'Innovation Hub BIT',
      description: 'A club dedicated to fostering innovation and entrepreneurship among students. We organize workshops, hackathons, and mentorship programs to help students turn their ideas into reality.',
      category: 'Innovation & Entrepreneurship',
      department: 'Institution-wide',
      focus: 'Startup ecosystem, innovation, entrepreneurship, mentorship programs'
    };
    setFormData(sampleClub);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Create New Club</h2>
            <p className="text-gray-600 text-sm mt-1">Start a new club at Bangalore Institute of Technology</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <Info size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Club Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., BIT Innovation Club"
              required
            />
          </div>

          {/* Category and Department Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {bitCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Building size={16} />
                Target Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {bitDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Club Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Target size={16} />
              Club Focus *
            </label>
            <input
              type="text"
              name="focus"
              value={formData.focus}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Innovation, startup ecosystem, entrepreneurship workshops"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Brief summary of what your club focuses on</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Provide a detailed description of your club, its objectives, activities, and what students can expect..."
              required
            />
            <div className="text-xs text-gray-500 mt-1 flex justify-between">
              <span>Minimum 20 characters required</span>
              <span>{formData.description.length}/500</span>
            </div>
          </div>

          {/* Sample Data Button */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-blue-800">Need inspiration?</h4>
                <p className="text-xs text-blue-600">Fill with sample data to get started</p>
              </div>
              <button
                type="button"
                onClick={fillSampleData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                'Create Club'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClub;