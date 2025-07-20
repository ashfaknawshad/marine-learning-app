import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import supabase from './supabaseClient';
import DashboardPage from './pages/DashboardPage';
import LearnTodayPage from './pages/LearnTodayPage';
import FlashcardsPage from './pages/FlashcardsPage';
import SpecimenQuizPage from './pages/SpecimenQuizPage';
import Auth from './components/Auth'; // Import the Auth component

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session on initial load
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    // Listen for changes in authentication state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Show a loading indicator while checking for a session
  if (loading) {
    return <div>Loading...</div>;
  }

  // If there's no session, show the Auth component
  if (!session) {
    return <Auth />;
  }

  // If there is a session, show the main application
  return (
    <Router>
      <div className="min-h-screen bg-blue-50 text-gray-900 p-8">
        <header className="flex justify-between items-center mb-6">
          <nav className="space-x-4">
            <Link to="/" className="text-blue-700 font-semibold">Dashboard</Link>
            <Link to="/learn" className="text-blue-700 font-semibold">What I Learned</Link>
            <Link to="/flashcards" className="text-blue-700 font-semibold">Flashcards</Link>
            <Link to="/quiz" className="text-blue-700 font-semibold">Specimen Quiz</Link>
          </nav>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
          >
            Sign Out
          </button>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/learn" element={<LearnTodayPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/quiz" element={<SpecimenQuizPage />} />
            {/* Redirect any unknown path to the dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;