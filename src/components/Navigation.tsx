import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, Plus, UserCircle, MessageCircle, Users } from 'lucide-react';
import CreateMenu from './CreateMenu';

function Navigation() {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  
  const baseClasses = "flex flex-col items-center justify-center py-2 text-gray-500 transition-colors duration-200";
  const activeClasses = "text-blue-600";

  return (
    <>
      <CreateMenu 
        isOpen={isCreateMenuOpen}
        onClose={() => setIsCreateMenuOpen(false)}
      />
      
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700">
        <div className="flex items-center justify-between px-2 mx-auto max-w-screen-xl">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `${baseClasses} flex-1 ${isActive ? activeClasses : ''}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          
          <NavLink
            to="/messages"
            className={({ isActive }) => `${baseClasses} flex-1 ${isActive ? activeClasses : ''}`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">Messages</span>
          </NavLink>
          
          <button
            onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
            className={`${baseClasses} flex-1 relative -top-4`}
          >
            <div className="bg-blue-500 rounded-full p-3 shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs mt-1">Add</span>
          </button>
          
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `${baseClasses} flex-1 ${isActive ? activeClasses : ''}`}
          >
            <Trophy className="w-6 h-6" />
            <span className="text-xs mt-1">Leaderboard</span>
          </NavLink>
          
          <NavLink
            to="/profile"
            className={({ isActive }) => `${baseClasses} flex-1 ${isActive ? activeClasses : ''}`}
          >
            <UserCircle className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </NavLink>

          <NavLink
            to="/family-members"
            className={({ isActive }) => `${baseClasses} w-12 ${isActive ? activeClasses : ''}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1">Family</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
}

export default Navigation;