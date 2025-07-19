import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LearnTodayPage from './pages/LearnTodayPage';
import FlashcardsPage from './pages/FlashcardsPage';
import SpecimenQuizPage from './pages/SpecimenQuizPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-blue-50 text-gray-900 p-8">
        <nav className="mb-6 space-x-4">
          <Link to="/" className="text-blue-700 font-semibold">Dashboard</Link>
          <Link to="/learn" className="text-blue-700 font-semibold">What I Learned</Link>
          <Link to="/flashcards" className="text-blue-700 font-semibold">Flashcards</Link>
          <Link to="/quiz" className="text-blue-700 font-semibold">Specimen Quiz</Link>
        </nav>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/learn" element={<LearnTodayPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/quiz" element={<SpecimenQuizPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
