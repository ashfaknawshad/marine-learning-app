// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';

// Import Components
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Footer from './components/Footer'; // 1. IMPORT THE FOOTER

// Import Page Components
import DashboardPage from './pages/DashboardPage';
import LearnTodayPage from './pages/LearnTodayPage';
import FlashcardsPage from './pages/FlashcardsPage';
import SpecimenQuizPage from './pages/SpecimenQuizPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { session, loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-xl font-semibold dark:text-white">Loading Application...</p>
      </div>
    );
  }

  // 2. The main container is now a flex column to manage layout
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-800">
      {session && <Navbar />}
      
      {/* 3. The main content area grows to push the footer down */}
      <main className={`flex-grow ${session ? "pt-20" : ""}`}>
        <Routes>
          {session ? (
            // --- Protected Routes (User is Logged In) ---
            <>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/learn-today" element={<LearnTodayPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/specimen-quiz" element={<SpecimenQuizPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            // --- Public Route (User is Logged Out) ---
            <Route path="*" element={<Auth />} />
          )}
        </Routes>
      </main>
      
      {/* 4. The Footer is placed here, outside of main, so it's always at the bottom */}
      <Footer />
    </div>
  );
}

export default App;