import React, { useState } from 'react';
import { Users, Calendar, MapPin, Star, UserPlus, UserMinus, Eye, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clubsAPI } from '../services/api';

const ClubCard = ({ club, onUpdate, onViewDetails }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const isJoined = club.members?.some(member => 
    typeof member === 'object' ? member._id === user?.id : member === user?.id
  );
  const isAdmin = club.admins?.some(admin => 
    typeof admin === 'object' ? admin._id === user?.id : admin === user?.id
  );

  const handleJoinLeave = async () => {
    try {
      setLoading(true);
      if (isJoined) {
        await clubsAPI.leaveClub(club._id);
      } else {
        await clubsAPI.joinClub(club._id);
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error joining/leaving club:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(club);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative">
      {/* Club Category Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
          {club.category}
        </span>
        {isJoined && (
          <Star className="w-5 h-5 text-yellow-500 fill-current" title="Joined Club" />
        )}
      </div>

      {/* Club Header */}
      <div className="mb-4 pr-20">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
          {club.name}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {club.description}
        </p>
      </div>
      
      {/* Club Stats */}
      <div className="flex items-center gap-6 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span>{club.members?.length || 0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          <span>{club.events?.length || 0} events</span>
        </div>
      </div>

      {/* Admin Badge */}
      {isAdmin && (
        <div className="mb-4">
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
            <Settings size={14} />
            Admin
          </span>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={handleViewDetails}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Eye size={16} />
          View Details
        </button>
        
        {user?.role === 'student' && !isAdmin && (
          <button
            onClick={handleJoinLeave}
            disabled={loading}
            className={`py-2 px-4 rounded-lg transition-colors flex items-center gap-2 font-medium min-w-[100px] justify-center ${
              isJoined
                ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                {isJoined ? <UserMinus size={16} /> : <UserPlus size={16} />}
                {isJoined ? 'Leave' : 'Join'}
              </>
            )}
          </button>
        )}
      </div>

      {/* Join Status Indicator */}
      {isJoined && !isAdmin && (
        <div className="mt-3 text-center">
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            ✓ You're a member
          </span>
        </div>
      )}
    </div>
  );
};

export default ClubCard;