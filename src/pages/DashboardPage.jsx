// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import DataManager from '../components/DataManager';
import { useUser } from '../context/UserContext'; // Import useUser

const DashboardPage = () => {
  // Use the profile from UserContext instead of a separate fetch
  const { profile } = useUser(); 

  // Helper function to determine the greeting based on the time of day
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good morning";
    } else if (currentHour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Dynamic Greeting */}
      {/* DARK MODE: Added dark:text-white */}
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
        {getGreeting()}
      </h1>
      {/* DARK MODE: Added dark:text-gray-300 */}
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        {/* Use profile.full_name for a better welcome message */}
        Welcome back, <span className="font-semibold">{profile?.full_name || 'Explorer'}</span>. Let's get learning.
      </p>
      
      {/* Data Management Component will also need dark mode styles */}
      <DataManager />
    </div>
  );
};

export default DashboardPage;