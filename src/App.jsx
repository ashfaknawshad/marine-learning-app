import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';

// Import Components
import Navbar from './components/Navbar';
import Auth from './components/Auth'; // Your login/signup component

// Import Page Components
import DashboardPage from './pages/DashboardPage';
import LearnTodayPage from './pages/LearnTodayPage';
import FlashcardsPage from './pages/FlashcardsPage';
import SpecimenQuizPage from './pages/SpecimenQuizPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { session, loading } = useUser();

  // 1. Display a full-page loading indicator while Supabase checks the session.
  // This is the most important part of the fix.
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-xl font-semibold dark:text-white">Loading Application...</p>
      </div>
    );
  }

  // 2. Once loading is complete, render the correct view based on session status.
  return (
    <div className="bg-gray-50 dark:bg-gray-800 min-h-screen">
      {/* The Navbar is only rendered if a session exists */}
      {session && <Navbar />}
      
      {/* The 'pt-20' class adds top padding to account for the sticky navbar height */}
      <main className={session ? "pt-20" : ""}>
        <Routes>
          {session ? (
            // --- Protected Routes (User is Logged In) ---
            <>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/learn-today" element={<LearnTodayPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/specimen-quiz" element={<SpecimenQuizPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* If a logged-in user tries to go to a non-existent page, redirect them to the dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            // --- Public Route (User is Logged Out) ---
            // The Auth component is shown for any path.
            <Route path="*" element={<Auth />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;