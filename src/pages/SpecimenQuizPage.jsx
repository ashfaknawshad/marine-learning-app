// src/pages/SpecimenQuizPage.jsx

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const SpecimenQuizPage = () => {
  const [logsWithImages, setLogsWithImages] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null); // { log, quizData }
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch learning logs that have an associated image
  useEffect(() => {
    const fetchImageLogs = async () => {
      const { data, error } = await supabase
        .from('learning_logs')
        .select(`
          id, text, image_url,
          department:departments(name),
          module:modules(name)
        `)
        .not('image_url', 'is', null) // Only select rows where image_url is NOT NULL
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching logs with images:', error.message);
      } else {
        setLogsWithImages(data);
      }
    };
    fetchImageLogs();
  }, []);

  // Function to start a quiz for a selected log
  const handleStartQuiz = async (log) => {
    setIsLoading(true);
    setError('');
    setCurrentQuiz(null);
    setSelectedAnswer(null);
    setShowAnswer(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('quiz-generator', {
        body: { log },
      });

      if (error) throw error;
      
      setCurrentQuiz({ log, quizData: data.quiz });

    } catch (err) {
      console.error('Failed to generate quiz:', err.message);
      setError('Could not generate a quiz for this entry. The AI might be busy. Please try another.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the user's answer selection
  const handleAnswerSelect = (option) => {
    if (showAnswer) return; // Don't allow changing answer after reveal
    setSelectedAnswer(option);
    setShowAnswer(true); // Automatically reveal the answer on selection
  };

  // Component to render the quiz UI
  const QuizInterface = () => {
    if (isLoading) {
      return <p className="text-center text-lg font-semibold animate-pulse">🔬 Generating quiz with AI...</p>;
    }
    if (!currentQuiz) {
      return <p className="text-center text-gray-500">Select an entry to start a quiz.</p>;
    }
    
    const { log, quizData } = currentQuiz;
    const isCorrect = selectedAnswer === quizData.correct_answer;

    return (
      <div className="bg-white p-6 rounded-lg shadow-xl animate-fade-in">
        <h2 className="text-2xl font-bold text-center mb-4">Guess the Specimen!</h2>
        <img src={log.image_url} alt="Specimen" className="w-full h-80 object-cover rounded-lg mb-6 shadow-md"/>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizData.options.map((option, index) => {
            const buttonClass = showAnswer
              ? option === quizData.correct_answer
                ? 'bg-green-500 hover:bg-green-600' // Correct answer
                : option === selectedAnswer
                ? 'bg-red-500 hover:bg-red-600' // Incorrectly selected answer
                : 'bg-gray-300 opacity-70' // Other incorrect options
              : 'bg-blue-500 hover:bg-blue-600'; // Default state

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showAnswer}
                className={`w-full text-white font-bold py-4 px-4 rounded-lg text-lg transition-all duration-300 ${buttonClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showAnswer && (
          <div className={`mt-6 p-4 rounded-lg text-center font-bold text-xl ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isCorrect ? 'Correct! 🎉' : `Not quite. The correct answer is ${quizData.correct_answer}.`}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: List of available quizzes */}
      <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">Available Quizzes</h2>
        <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
          {logsWithImages.map((log) => (
            <li 
              key={log.id} 
              onClick={() => handleStartQuiz(log)}
              className="p-3 rounded-md hover:bg-blue-100 cursor-pointer transition-colors"
            >
              <p className="font-bold text-blue-800">{log.module.name}</p>
              <p className="text-sm text-gray-600 truncate">{log.text}</p>
            </li>
          ))}
          {logsWithImages.length === 0 && <p className="text-gray-500">No entries with images found. Add some learning logs with images to create quizzes!</p>}
        </ul>
      </div>

      {/* Right Column: The Quiz Interface */}
      <div className="lg:col-span-2">
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}
        <QuizInterface />
      </div>
    </div>
  );
};

export default SpecimenQuizPage;