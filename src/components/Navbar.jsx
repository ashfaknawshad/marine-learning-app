import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo'; // Imports the component that displays your logo
import supabase from '../supabaseClient';

const Navbar = () => {
  // This is the style object that will be applied to the active NavLink.
  const activeLinkStyle = {
    backgroundColor: '#3b82f6', // A vibrant blue
    color: 'white',
  };

  // This function calls the Supabase sign-out method.
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener in your App.jsx will handle the redirect.
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Section 1: Logo */}
          {/* It's wrapped in a NavLink so clicking it takes the user to the dashboard. */}
          <div className="flex-shrink-0">
            <NavLink to="/">
              <Logo />
            </NavLink>
          </div>

          {/* Section 2: Navigation Links and Sign Out Button */}
          {/* This container holds all items on the right side of the navbar. */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              
              {/* Dashboard Link */}
              <NavLink
                to="/"
                end // The 'end' prop ensures this only matches the exact "/" path.
                className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                Dashboard
              </NavLink>

              {/* What I Learned Today Link */}
              <NavLink
                to="/learn-today"
                className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                What I Learned Today
              </NavLink>

              {/* AI Flashcards Link */}
              <NavLink
                to="/flashcards"
                className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                AI Flashcards
              </NavLink>

              {/* Specimen Quiz Link */}
              <NavLink
                to="/specimen-quiz"
                className="text-gray-600 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                Specimen Quiz
              </NavLink>
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors ml-4"
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