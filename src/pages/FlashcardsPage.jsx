// src/pages/FlashcardsPage.jsx

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const FlashcardsPage = () => {
  const [learningLogs, setLearningLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all learning logs from the database
  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('learning_logs')
        .select(`
          *,
          department:departments(name),
          module:modules(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching logs:', error.message);
        setError('Could not fetch learning logs.');
      } else {
        setLearningLogs(data);
      }
    };
    fetchLogs();
  }, []);

  // Function to generate flashcards
  const handleGenerateFlashcards = async (log) => {
    setSelectedLog(log);
    setIsLoading(true);
    setFlashcards([]);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('flashcard-generator', {
        body: { text: log.text },
      });

      if (invokeError) {
        throw invokeError;
      }
      
      // The AI might return the array inside a root key, e.g., { "flashcards": [...] }
      // We handle both cases: a direct array or a nested one.
      const generatedCards = data.flashcards.flashcards || data.flashcards;

      if (!Array.isArray(generatedCards)) {
        throw new Error("AI did not return a valid array of flashcards.");
      }

      setFlashcards(generatedCards);

    } catch (err) {
      console.error(err);
      setError('Failed to generate flashcards. Please check the function logs and your OpenAI billing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Component to display a single flashcard with reveal functionality
  const Flashcard = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
      <div
        className="w-full h-64 p-4 rounded-lg shadow-lg cursor-pointer transform transition-transform duration-500"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className="relative w-full h-full text-center transition-transform duration-500"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
        >
          {/* Front of Card (Question) */}
          <div className="absolute w-full h-full bg-blue-200 flex items-center justify-center p-4 rounded-lg" style={{ backfaceVisibility: 'hidden' }}>
            <div>
              <h3 className="text-sm font-bold text-blue-800 mb-2">QUESTION</h3>
              <p className="text-lg font-semibold text-blue-900">{card.question}</p>
            </div>
          </div>
          {/* Back of Card (Answer) */}
          <div className="absolute w-full h-full bg-green-200 flex items-center justify-center p-4 rounded-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
             <div>
              <h3 className="text-sm font-bold text-green-800 mb-2">ANSWER</h3>
              <p className="text-md text-green-900">{card.answer}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Generate Study Flashcards</h1>
      
      {/* List of Learning Logs */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-3">Select a Learning Log to Generate Flashcards From:</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {learningLogs.map((log) => (
            <div key={log.id} className="flex justify-between items-center p-3 rounded-md hover:bg-gray-100 transition-colors">
              <div>
                <span className="font-bold text-gray-800">{log.department.name} - {log.module.name}</span>
                <p className="text-sm text-gray-600 truncate max-w-2xl">{log.text}</p>
              </div>
              <button
                onClick={() => handleGenerateFlashcards(log)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex-shrink-0"
                disabled={isLoading}
              >
                {isLoading && selectedLog?.id === log.id ? 'Generating...' : 'Generate'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Flashcards Display Area */}
      {isLoading && <p className="text-center font-semibold text-lg animate-pulse">🧠 AI is thinking... Please wait.</p>}
      {error && <p className="text-center text-red-500 font-bold">{error}</p>}
      
      {flashcards.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-center mb-6">Your Flashcards (Click to Flip)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card, index) => (
              <Flashcard key={index} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;