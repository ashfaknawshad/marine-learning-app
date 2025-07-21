import React, { useState, useEffect, useMemo } from 'react';
import supabase from '../supabaseClient';

// A simple arrow icon component for the accordion
const AccordionIcon = ({ isOpen }) => (
  <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
  </svg>
);

const SpecimenQuizPage = () => {
  const [logsWithImages, setLogsWithImages] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState({}); // For accordion state

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
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching logs with images:', error.message);
      } else {
        setLogsWithImages(data);
      }
    };
    fetchImageLogs();
  }, []);
  
  // Memoize the grouped logs to prevent re-computation on every render
  const groupedLogs = useMemo(() => {
    return logsWithImages.reduce((acc, log) => {
      const deptName = log.department?.name || 'Uncategorized';
      const moduleName = log.module?.name || 'General';

      if (!acc[deptName]) {
        acc[deptName] = {};
      }
      if (!acc[deptName][moduleName]) {
        acc[deptName][moduleName] = [];
      }
      acc[deptName][moduleName].push(log);
      return acc;
    }, {});
  }, [logsWithImages]);

  // Function to toggle accordion sections
  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

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
    if (showAnswer) return;
    setSelectedAnswer(option);
    setShowAnswer(true);
  };

  // Component to render the quiz UI
  const QuizInterface = () => {
    if (isLoading) {
      return <p className="text-center text-lg font-semibold animate-pulse dark:text-white">🔬 Generating quiz with AI...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500 p-4 bg-red-50 rounded-lg">{error}</p>;
    }
    if (!currentQuiz) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 p-10 border-2 border-dashed dark:border-gray-600 rounded-lg">
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Welcome to the Specimen Quiz!</h2>
          <p>Select an entry from the "Available Quizzes" list to begin.</p>
        </div>
      );
    }
    
    const { log, quizData } = currentQuiz;
    const isCorrect = selectedAnswer === quizData.correct_answer;

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl animate-fade-in">
        <h2 className="text-2xl font-bold text-center mb-4 dark:text-white">Guess the Specimen!</h2>
        <img src={log.image_url} alt="Specimen" className="w-full h-80 object-cover rounded-lg mb-6 shadow-md"/>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizData.options.map((option, index) => {
            const buttonClass = showAnswer
              ? option === quizData.correct_answer
                ? 'bg-green-500 hover:bg-green-600'
                : option === selectedAnswer
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-300 dark:bg-gray-600 opacity-70'
              : 'bg-blue-500 hover:bg-blue-600';

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
          <div className={`mt-6 p-4 rounded-lg text-center font-bold text-xl ${isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
            {isCorrect ? 'Correct! 🎉' : `Not quite. The correct answer is ${quizData.correct_answer}.`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Organized list of available quizzes */}
      <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-full">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2 dark:text-white dark:border-gray-600">Available Quizzes</h2>
        <div className="space-y-2 max-h-[75vh] overflow-y-auto">
          {Object.keys(groupedLogs).length > 0 ? (
            Object.keys(groupedLogs).map(deptName => (
              <div key={deptName} className="border-b last:border-b-0 dark:border-gray-700">
                {/* Department Header */}
                <button onClick={() => toggleSection(deptName)} className="w-full flex justify-between items-center p-3 font-bold text-lg text-left text-blue-900 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-gray-700 rounded-md">
                  <span>{deptName}</span>
                  <AccordionIcon isOpen={!!openSections[deptName]} />
                </button>
                {/* Modules within the Department */}
                {!!openSections[deptName] && (
                  <div className="pl-4 pt-2 pb-2 animate-fade-in-down">
                    {Object.keys(groupedLogs[deptName]).map(moduleName => (
                      <div key={moduleName}>
                        <h4 className="font-semibold text-md text-gray-700 dark:text-gray-400 mt-2 mb-1">{moduleName}</h4>
                        <ul className="space-y-1">
                          {groupedLogs[deptName][moduleName].map(log => (
                            <li 
                              key={log.id} 
                              onClick={() => handleStartQuiz(log)}
                              className="p-2 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 cursor-pointer transition-colors"
                            >
                              <p className="text-sm text-gray-800 dark:text-gray-300 truncate">{log.text}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 p-3">No entries with images found. Add some learning logs with images to create quizzes!</p>
          )}
        </div>
      </div>

      {/* Right Column: The Quiz Interface */}
      <div className="lg:col-span-2">
        <QuizInterface />
      </div>
    </div>
  );
};

export default SpecimenQuizPage;