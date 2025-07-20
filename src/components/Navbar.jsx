import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import supabase from '../supabaseClient';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { session, profile } = useUser();

  const activeLinkStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const fallbackAvatar = `https://api.pravatar.cc/150?u=${session?.user?.id}`;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <NavLink to="/">
              <Logo />
            </NavLink>
          </div>
          <div className="hidden md:flex items-center">
            <div className="flex items-baseline space-x-4">
              {/* Navigation links are correct */}
              <NavLink to="/" end className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Dashboard</NavLink>
              <NavLink to="/learn-today" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>What I Learned Today</NavLink>
              <NavLink to="/flashcards" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>AI Flashcards</NavLink>
              <NavLink to="/specimen-quiz" className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Specimen Quiz</NavLink>
            </div>
            
            {/* User Profile Section */}
            <div className="ml-10 flex items-center space-x-4">
              {/* FIX: Add the user's full name next to the avatar */}
              {profile?.full_name && (
                <span className="text-gray-700 font-semibold hidden lg:block">
                  {profile.full_name}
                </span>
              )}
              
              <NavLink to="/profile" title="Go to your profile">
                <img
                  src={profile?.avatar_url || fallbackAvatar}
                  alt="User profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 hover:border-blue-600 transition-all"
                />
              </NavLink>

              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;