import React, { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import supabase from './supabaseClient'; 

import Auth from './components/Auth'; 
import Navbar from './components/Navbar'; // Import the Navbar 
import DashboardPage from './pages/DashboardPage'; 
import LearnTodayPage from './pages/LearnTodayPage'; 
import FlashcardsPage from './pages/FlashcardsPage'; 
import SpecimenQuizPage from './pages/SpecimenQuizPage'; 

const App = () => { 
  const [session, setSession] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => { 
    const getSession = async () => { 
      const { data: { session } } = await supabase.auth.getSession(); 
      setSession(session); 
      setLoading(false); 
    }; 

    getSession(); 

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { 
      setSession(session); 
    }); 

    return () => subscription.unsubscribe(); 
  }, []); 

  if (loading) { 
    return <div>Loading...</div>; // Or a more styled loader 
  } 

  return ( 
    <Router> 
      {session && <Navbar />} {/* Render Navbar only when logged in */} 
      <main> 
        <Routes> 
          <Route 
            path="/" 
            element={session ? <DashboardPage /> : <Navigate to="/auth" />} 
          /> 
          <Route 
            path="/auth" 
            element={!session ? <Auth /> : <Navigate to="/" />} 
          /> 
          <Route 
            path="/learn-today" 
            element={session ? <LearnTodayPage /> : <Navigate to="/auth" />} 
          /> 
          <Route 
            path="/flashcards" 
            element={session ? <FlashcardsPage /> : <Navigate to="/auth" />} 
          /> 
          <Route 
            path="/specimen-quiz" 
            element={session ? <SpecimenQuizPage /> : <Navigate to="/auth" />} 
          /> 
        </Routes> 
      </main> 
    </Router> 
  ); 
}; 

export default App;