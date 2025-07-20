// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import DataManager from '../components/DataManager';

const DashboardPage = () => {
  const [userEmail, setUserEmail] = useState('');

  // Fetch the current user's data when the component loads
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    getUserData();
  }, []);

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
      <h1 className="text-4xl font-bold text-gray-800">
        {getGreeting()}
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Welcome back, <span className="font-semibold">{userEmail}</span>. Let's get learning.
      </p>
      
      {/* Data Management Component */}
      <DataManager />
    </div>
  );
};

export default DashboardPage;