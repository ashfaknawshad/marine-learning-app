// src/pages/LearnTodayPage.jsx

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const LearnTodayPage = () => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState('');
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newModule, setNewModule] = useState('');

  // Fetching logic remains the same...
  useEffect(() => { /* ... */ }, []);
  useEffect(() => { /* ... */ }, [selectedDepartment]);
  
  const handleDepartmentChange = (e) => { /* ... */ };
  const handleModuleChange = (e) => { /* ... */ };
  const handleSubmit = async (e) => { /* ... */ };

  return (
    // DARK MODE: Added dark:bg-gray-800 to main container
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* DARK MODE: Added dark:text-white */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">What I Learned Today</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="space-y-2">
          {/* DARK MODE: Added dark:text-gray-200 */}
          <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">Department</label>
          {/* DARK MODE: Added dark styles to select */}
          <select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="" disabled>Select a Department</option>
            {departments.map((dep) => (<option key={dep.id} value={dep.id}>{dep.name}</option>))}
          </select>
          {/* DARK MODE: Added dark styles to input */}
          <input
            type="text"
            value={newDepartment}
            onChange={(e) => { setNewDepartment(e.target.value); setSelectedDepartment(''); }}
            placeholder="Or, create a new department"
            className="w-full p-3 border rounded-md mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          {/* DARK MODE: Added dark:text-gray-200 */}
          <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">Module</label>
          {/* DARK MODE: Added dark styles to select */}
          <select
            value={selectedModule}
            onChange={handleModuleChange}
            disabled={!selectedDepartment && !newDepartment}
            className="w-full p-3 border rounded-md bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:disabled:bg-gray-600"
          >
            <option value="" disabled>Select a Module</option>
            {modules.map((mod) => (<option key={mod.id} value={mod.id}>{mod.name}</option>))}
          </select>
           {/* DARK MODE: Added dark styles to input */}
          <input
            type="text"
            value={newModule}
            onChange={(e) => { setNewModule(e.target.value); setSelectedModule(''); }}
            disabled={!selectedDepartment && !newDepartment}
            placeholder="Or, create a new module"
            className="w-full p-3 border rounded-md mt-2 disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:disabled:bg-gray-600 dark:placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          {/* DARK MODE: Added dark:text-gray-200 */}
          <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">Learning Content</label>
          {/* DARK MODE: Added dark styles to textarea */}
          <textarea
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you learned in detail..."
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
            rows={6}
          />
        </div>

        <div className="space-y-2">
          {/* DARK MODE: Added dark:text-gray-200 */}
          <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">Reference Image</label>
          {/* DARK MODE: Styled file input for dark mode */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900/40 dark:file:text-blue-200 dark:hover:file:bg-blue-900/60"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300">
          Submit Learning Entry
        </button>

        {/* DARK MODE: Added dark:text-gray-300 */}
        {status && <p className="text-sm mt-4 text-center dark:text-gray-300">{status}</p>}
      </form>
    </div>
  );
};

export default LearnTodayPage;