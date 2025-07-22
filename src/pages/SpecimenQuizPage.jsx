import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const SpecimenQuizPage = () => {
  // --- STATE MANAGEMENT ---
  const [availableLogs, setAvailableLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Quiz session state
  const [quizState, setQuizState] = useState('setup'); // 'setup', 'preparing', 'active', 'finished'
  const [quizSessionData, setQuizSessionData] = useState([]); // Will hold the *full* generated quiz data
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  // Single question state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchImageLogs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('learning_logs')
        .select('id, text, image_url, department:departments(name), module:modules(name)')
        .not('image_url', 'is', null);

      if (error) {
        console.error('Error fetching logs with images:', error.message);
        setError('Could not fetch specimens. Please check your connection.');
      } else {
        setAvailableLogs(data);
      }
      setIsLoading(false);
    };
    fetchImageLogs();
  }, []);

  // --- NEW: PRE-GENERATION QUIZ LOGIC ---

  // This function still generates a SINGLE quiz, but we'll call it in a loop.
  const generateQuestionForLog = useCallback(async (log) => {
    try {
      const { data, error } = await supabase.functions.invoke('quiz-generator', {
        body: { log },
      });
      if (error) throw error;
      return { log, quizData: data.quiz };
    } catch (err) {
      console.error(`Failed to generate quiz for log ${log.id}:`, err.message);
      return { log, error: 'Failed to generate question.' }; // Return an error object
    }
  }, []);

  // The startQuiz function is now responsible for generating ALL questions upfront.
  const startQuiz = useCallback(async (questionCount) => {
    setQuizState('preparing'); // Set a new 'preparing' state for the initial load
    setCurrentQuestionIndex(0);
    setScore(0);
    setError('');

    const selectedLogs = shuffleArray(availableLogs).slice(0, questionCount);

    // Use Promise.all to invoke all quiz generations in parallel for speed.
    const generationPromises = selectedLogs.map(log => generateQuestionForLog(log));
    const allGeneratedQuestions = await Promise.all(generationPromises);

    // Filter out any questions that might have failed to generate
    const successfulQuestions = allGeneratedQuestions.filter(q => q && !q.error);

    if (successfulQuestions.length === 0) {
      setError('Could not generate any quiz questions. Please try again later.');
      setQuizState('setup');
      return;
    }

    setQuizSessionData(successfulQuestions);
    setQuizState('active'); // Switch to 'active' only after all data is ready
  }, [availableLogs, generateQuestionForLog]);

  // handleNextQuestion is now much simpler and synchronous. No more waiting!
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowAnswer(false);

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < quizSessionData.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setQuizState('finished');
    }
  };
  
  const handleAnswerSelect = (option) => {
    if (showAnswer) return;
    const currentQuestion = quizSessionData[currentQuestionIndex];
    setSelectedAnswer(option);
    setShowAnswer(true);
    if (option === currentQuestion.quizData.correct_answer) {
      setScore(prev => prev + 1);
    }
  };

  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-lg font-semibold animate-pulse dark:text-white">Loading Specimens...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500 p-4 bg-red-50 dark:border-red-500 border rounded-lg">{error}</p>;
    }
    
    // NEW: Handle the 'preparing' state with a dedicated loading screen
    if (quizState === 'preparing') {
        return <QuizPreparationScreen />;
    }
    
    switch (quizState) {
      case 'active':
        return (
          <QuizInterface
            currentQuizData={quizSessionData[currentQuestionIndex]}
            selectedAnswer={selectedAnswer}
            showAnswer={showAnswer}
            onAnswerSelect={handleAnswerSelect}
            onNextQuestion={handleNextQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quizSessionData.length}
          />
        );
      case 'finished':
        return (
          <ResultsScreen
            score={score}
            totalQuestions={quizSessionData.length}
            onRestart={() => setQuizState('setup')}
          />
        );
      case 'setup':
      default:
        return (
          <QuizSetup
            specimenCount={availableLogs.length}
            onStartQuiz={startQuiz}
          />
        );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-2 text-gray-800 dark:text-white">Specimen Quiz</h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Test your knowledge with AI-generated quizzes from your own learning logs.</p>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl min-h-[400px] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

// NEW Component for the initial loading phase
const QuizPreparationScreen = () => (
    <div className="text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Preparing Your Quiz...</h2>
        <p className="text-gray-500 dark:text-gray-400">The AI is generating all your questions upfront for a smooth experience.</p>
    </div>
);

const QuizSetup = ({ specimenCount, onStartQuiz }) => {
  if (specimenCount === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">No Specimens Found</h2>
        <p className="text-gray-500 dark:text-gray-400">Please add some learning logs with images to create a quiz.</p>
      </div>
    );
  }
  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-3xl font-bold mb-2 dark:text-white">{specimenCount} Specimens Ready!</h2>
      <p className="mb-8 text-gray-600 dark:text-gray-300">Click below to start a quiz with all your specimens.</p>
      <div className="flex justify-center">
        <button
          onClick={() => onStartQuiz(specimenCount)}
          className="w-48 h-48 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center text-2xl shadow-lg transition-transform transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

// QuizInterface now has no loading state of its own
const QuizInterface = ({ currentQuizData, selectedAnswer, showAnswer, onAnswerSelect, onNextQuestion, questionNumber, totalQuestions }) => {
    if (!currentQuizData) { // Safety check
      return <p>Error displaying question.</p>;
    }

  const { log, quizData: qd } = currentQuizData;
  const isCorrect = selectedAnswer === qd.correct_answer;

  return (
    <div className="w-full animate-fade-in">
      <p className="text-right font-bold text-gray-600 dark:text-gray-400 mb-2">{questionNumber} / {totalQuestions}</p>
      <img src={log.image_url} alt="Specimen" className="w-full h-80 object-cover rounded-lg mb-6 shadow-md"/>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qd.options.map((option, index) => {
          const buttonClass = showAnswer
            ? option === qd.correct_answer ? 'bg-green-500' : (option === selectedAnswer ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-600 opacity-60')
            : 'bg-blue-500 hover:bg-blue-600';
          return (
            <button key={index} onClick={() => onAnswerSelect(option)} disabled={showAnswer} className={`w-full text-white font-bold py-4 px-4 rounded-lg text-lg transition-all ${buttonClass}`}>
              {option}
            </button>
          );
        })}
      </div>
      {showAnswer && (
        <div className="mt-6 text-center">
            <div className={`p-4 rounded-lg font-bold text-xl ${isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                {isCorrect ? 'Correct! 🎉' : `The answer is ${qd.correct_answer}.`}
            </div>
            <button onClick={onNextQuestion} className="mt-4 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-indigo-700 transition-transform hover:scale-105">
                {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}
            </button>
        </div>
      )}
    </div>
  );
};

const ResultsScreen = ({ score, totalQuestions, onRestart }) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  let feedback = { message: "Great job!", emoji: "🎉" };
  if (percentage < 50) feedback = { message: "Keep trying!", emoji: "💪" };
  else if (percentage < 80) feedback = { message: "Good work!", emoji: "👍" };

  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-3xl font-bold mb-2 dark:text-white">Quiz Complete! {feedback.emoji}</h2>
      <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">{feedback.message}</p>
      <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-6">{score} / {totalQuestions}</p>
      <button onClick={onRestart} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-700 transition-transform hover:scale-105">
        Start New Quiz
      </button>
    </div>
  );
};

export default SpecimenQuizPage;