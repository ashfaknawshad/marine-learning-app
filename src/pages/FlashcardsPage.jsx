// src/pages/FlashcardsPage.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext'; // Import the useUser hook

const FlashcardsPage = () => {
  const { profile } = useUser(); // Get the current user's profile

  // State for data
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  
  // State for user selections
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('all'); // Default to 'all'

  // State for UI and results
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch departments belonging to the current user
  useEffect(() => {
    // Don't fetch if the profile hasn't loaded yet
    if (!profile) return;

    const fetchDepartments = async () => {
      // The KEY FIX: Filter departments by the logged-in user's ID
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('user_id', profile.id) // Only get the user's own departments
        .order('name');
        
      if (error) {
        console.error('Error fetching departments:', error.message);
      } else {
        setDepartments(data);
      }
    };
    fetchDepartments();
  }, [profile]); // Re-run when the user profile is available

  // Fetch modules when a department is selected
  useEffect(() => {
    // Reset downstream selections when department changes
    setModules([]);
    setSelectedModule('');
    setSubtopics([]);
    setSelectedSubtopic('all');

    if (selectedDepartment) {
      const fetchModules = async () => {
        // This query is implicitly secured by RLS, but filtering by department_id is sufficient here
        const { data, error } = await supabase.from('modules').select('id, name').eq('department_id', selectedDepartment).order('name');
        if (error) console.error('Error fetching modules:', error.message);
        else setModules(data);
      };
      fetchModules();
    }
  }, [selectedDepartment]);

  // Fetch subtopics when a module is selected
  useEffect(() => {
    // Reset downstream selection
    setSubtopics([]);
    setSelectedSubtopic('all');

    if (selectedModule) {
      const fetchSubtopics = async () => {
        // This query is also secured by RLS
        const { data, error } = await supabase.from('subtopics').select('id, name').eq('module_id', selectedModule).order('name');
        if (error) console.error('Error fetching subtopics:', error.message);
        else setSubtopics(data);
      };
      fetchSubtopics();
    }
  }, [selectedModule]);

  // Generate flashcards based on selection
  const handleGenerateFlashcards = async () => {
    if (!selectedModule) {
      alert('Please select a module first.');
      return;
    }
    setIsLoading(true);
    setFlashcards([]);
    setError(null);
    try {
      // Build a dynamic query based on user selection
      let query = supabase.from('learning_logs').select('text');
      
      // Always filter by the selected module
      query = query.eq('module_id', selectedModule);

      // If a specific subtopic is chosen (and not the 'all' option), add that filter
      if (selectedSubtopic && selectedSubtopic !== 'all') {
        query = query.eq('subtopic_id', selectedSubtopic);
      } 
      // If 'all' is selected, we don't add the subtopic filter. This correctly includes
      // logs with a subtopic AND logs where subtopic_id is NULL (our old data).

      const { data: logs, error: logError } = await query;

      if (logError) throw logError;
      if (!logs || logs.length === 0) throw new Error("No learning logs found for this specific selection.");
      
      const combinedText = logs.map(log => log.text).join('\n\n---\n\n');
      
      const { data: functionData, error: invokeError } = await supabase.functions.invoke('flashcard-generator', { body: { text: combinedText } });
      if (invokeError) throw invokeError;
      
      const generatedCards = functionData.flashcards;
      if (!Array.isArray(generatedCards)) throw new Error("The AI did not return a valid array of flashcards. Please try again.");
      
      setFlashcards(generatedCards);

    } catch (err) {
      console.error(err);
      setError(`Failed to generate flashcards: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUB-COMPONENTS ---

  const Flashcard = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
      <div className="w-full h-64 p-4 rounded-lg shadow-lg cursor-pointer transform transition-transform duration-500" style={{ perspective: '1000px' }} onClick={() => setIsFlipped(!isFlipped)}>
        <div className="relative w-full h-full text-center transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'none' }}>
          {/* Front of the card */}
          <div className="absolute w-full h-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center p-4 rounded-lg" style={{ backfaceVisibility: 'hidden' }}>
            <div>
              <h3 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">QUESTION</h3>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{card.question}</p>
            </div>
          </div>
          {/* Back of the card */}
          <div className="absolute w-full h-full bg-green-200 dark:bg-green-800 flex items-center justify-center p-4 rounded-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div>
              <h3 className="text-sm font-bold text-green-800 dark:text-green-200 mb-2">ANSWER</h3>
              <p className="text-md text-green-900 dark:text-green-100">{card.answer}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Generate Flashcards</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-end gap-4">
        
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">1. Select Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          >
            <option value="" disabled>Choose a department...</option>
            {departments.map((dep) => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
          </select>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">2. Select Module</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            disabled={!selectedDepartment}
            className="w-full p-3 border rounded-md bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-600"
          >
            <option value="" disabled>Choose a module...</option>
            {modules.map((mod) => <option key={mod.id} value={mod.id}>{mod.name}</option>)}
          </select>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">3. Select Subtopic (Optional)</label>
          <select
            value={selectedSubtopic}
            onChange={(e) => setSelectedSubtopic(e.target.value)}
            disabled={!selectedModule}
            className="w-full p-3 border rounded-md bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-600"
          >
            <option value="all">All Subtopics in this Module</option>
            {subtopics.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
          </select>
        </div>
        
        <button
          onClick={handleGenerateFlashcards}
          disabled={!selectedModule || isLoading}
          className="w-full md:w-auto flex-shrink-0 bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {isLoading && <p className="text-center font-semibold text-lg animate-pulse dark:text-white">🧠 AI is thinking... Please wait.</p>}
      {error && <p className="text-center text-red-500 font-bold p-4 bg-red-50 dark:bg-red-900/40 rounded-lg">{error}</p>}
      
      {flashcards.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">Your Flashcards (Click to Flip)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card, index) => <Flashcard key={index} card={card} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;