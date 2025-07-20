// ... (imports remain the same)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import LearnTodayPage from './pages/LearnTodayPage';
import FlashcardsPage from './pages/FlashcardsPage';
import SpecimenQuizPage from './pages/SpecimenQuizPage';
import ProfilePage from './pages/ProfilePage';


const AppLayout = () => {
  const { session } = useUser();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <>
      <Navbar />
      {/* FIX: Added padding to the main content area */}
      <main className="p-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/learn-today" element={<LearnTodayPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/specimen-quiz" element={<SpecimenQuizPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;