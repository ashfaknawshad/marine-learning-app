// src/pages/FlashcardsPage.jsx

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const FlashcardsPage = () => {
  // State for dropdowns
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedModule, setSelectedModule] = useState('');

  // State for results
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Data Fetching for Dropdowns ---
  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase.from('departments').select('id, name').order('name');
      if (error) console.error('Error fetching departments:', error);
      else setDepartments(data);
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      const fetchModules = async () => {
        const { data, error } = await supabase
          .from('modules')
          .select('id, name')
          .eq('department_id', selectedDepartment)
          .order('name');
        if (error) console.error('Error fetching modules:', error);
        else setModules(data);
      };
      fetchModules();
    }
    setModules([]);
    setSelectedModule('');
  }, [selectedDepartment]);

  // --- Flashcard Generation Logic ---
  const handleGenerateFlashcards = async () => {
    if (!selectedModule) {
      alert('Please select a module first.');
      return;
    }
    
    setIsLoading(true);
    setFlashcards([]);
    setError(null);

    try {
      // 1. Fetch all learning logs for the selected module
      const { data: logs, error: logError } = await supabase
        .from('learning_logs')
        .select('text')
        .eq('module_id', selectedModule);

      if (logError) throw logError;
      if (!logs || logs.length === 0) {
        throw new Error("This module has no learning logs to generate flashcards from.");
      }

      // 2. Concatenate all text into one large block
      const combinedText = logs.map(log => log.text).join('\n\n---\n\n');

      // 3. Invoke the Edge Function with the combined text
      const { data: functionData, error: invokeError } = await supabase.functions.invoke('flashcard-generator', {
        body: { text: combinedText },
      });

      if (invokeError) throw invokeError;
      
      const generatedCards = functionData.flashcards;
      if (!Array.isArray(generatedCards)) {
        throw new Error("AI did not return a valid array of flashcards.");
      }

      setFlashcards(generatedCards);

    } catch (err) {
      console.error(err);
      setError(`Failed to generate flashcards: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Components (Flashcard component can remain the same) ---
  const Flashcard = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
      <div className="w-full h-64 p-4 rounded-lg shadow-lg cursor-pointer transform transition-transform duration-500" style={{ perspective: '1000px' }} onClick={() => setIsFlipped(!isFlipped)}>
        <div className="relative w-full h-full text-center transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'none' }}>
          <div className="absolute w-full h-full bg-blue-200 flex items-center justify-center p-4 rounded-lg" style={{ backfaceVisibility: 'hidden' }}><div><h3 className="text-sm font-bold text-blue-800 mb-2">QUESTION</h3><p className="text-lg font-semibold text-blue-900">{card.question}</p></div></div>
          <div className="absolute w-full h-full bg-green-200 flex items-center justify-center p-4 rounded-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}><div><h3 className="text-sm font-bold text-green-800 mb-2">ANSWER</h3><p className="text-md text-green-900">{card.answer}</p></div></div>
        </div>
      </div>
    );
  };


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Generate Flashcards by Module</h1>
      
      {/* Selection UI */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">1. Select Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full p-3 border rounded-md bg-gray-50"
          >
            <option value="" disabled>Choose a department...</option>
            {departments.map((dep) => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
          </select>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">2. Select Module</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            disabled={!selectedDepartment}
            className="w-full p-3 border rounded-md bg-gray-50 disabled:bg-gray-200"
          >
            <option value="" disabled>Choose a module...</option>
            {modules.map((mod) => <option key={mod.id} value={mod.id}>{mod.name}</option>)}
          </select>
        </div>
        
        <button
          onClick={handleGenerateFlashcards}
          disabled={!selectedModule || isLoading}
          className="w-full md:w-auto mt-4 md:mt-0 bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Cards'}
        </button>
      </div>

      {/* Display Area */}
      {isLoading && <p className="text-center font-semibold text-lg animate-pulse">🧠 AI is thinking... Please wait.</p>}
      {error && <p className="text-center text-red-500 font-bold">{error}</p>}
      
      {flashcards.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-center mb-6">Your Flashcards (Click to Flip)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card, index) => <Flashcard key={index} card={card} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;