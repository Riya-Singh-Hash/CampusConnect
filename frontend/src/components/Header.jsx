import React from 'react';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ title = "ClubHub" }) => {
  const { user, logout } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'club-member': return 'bg-green-100 text-green-800';
      case 'club-admin': return 'bg-purple-100 text-purple-800';
      case 'super-admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
            {user?.role?.replace('-', ' ').toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="flex items-center gap-2 text-gray-700">
            <User size={20} />
            <span className="font-medium">{user?.name}</span>
          </div>
          
          <button
            onClick={logout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;