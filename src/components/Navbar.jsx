import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import supabase from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext'; // 1. Import useTheme

// Icons for the theme toggle button
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);


const Navbar = () => {
  const { session, profile } = useUser();
  const { theme, toggleTheme } = useTheme(); // 2. Get theme and toggle function from context
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeLinkStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const fallbackAvatar = `https://api.pravatar.cc/150?u=${session?.user?.id}`;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" onClick={closeMenu}>
              <Logo />
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" end className="text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Dashboard</NavLink>
            <NavLink to="/learn-today" className="text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>What I Learned Today</NavLink>
            <NavLink to="/flashcards" className="text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>AI Flashcards</NavLink>
            <NavLink to="/specimen-quiz" className="text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Specimen Quiz</NavLink>
          </div>

          {/* Desktop Profile Section */}
          <div className="hidden md:flex items-center ml-10 space-x-4">
            {/* 3. ADD THEME TOGGLE BUTTON FOR DESKTOP */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {profile?.full_name && (
              <span className="text-gray-700 dark:text-gray-200 font-semibold hidden lg:block">
                {profile.full_name}
              </span>
            )}
            <NavLink to="/profile" title="Go to your profile" className="flex-shrink-0">
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

          {/* Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" end onClick={closeMenu} className="block text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Dashboard</NavLink>
            <NavLink to="/learn-today" onClick={closeMenu} className="block text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>What I Learned Today</NavLink>
            <NavLink to="/flashcards" onClick={closeMenu} className="block text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>AI Flashcards</NavLink>
            <NavLink to="/specimen-quiz" onClick={closeMenu} className="block text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Specimen Quiz</NavLink>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-5">
              <div className="flex items-center">
                <NavLink to="/profile" onClick={closeMenu} className="flex-shrink-0">
                  <img
                    src={profile?.avatar_url || fallbackAvatar}
                    alt="User profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                  />
                </NavLink>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{profile?.full_name}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{session?.user?.email}</div>
                </div>
              </div>
              {/* 4. ADD THEME TOGGLE BUTTON FOR MOBILE */}
              <button
                onClick={() => { toggleTheme(); closeMenu(); }}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              </button>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <NavLink to="/profile" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Your Profile</NavLink>
              <button
                onClick={() => { handleSignOut(); closeMenu(); }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;