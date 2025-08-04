// src/pages/LearnTodayPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';

const LearnTodayPage = () => {
  const { profile } = useUser();

  // Form state
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  // --- NEW STATE ---
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newModule, setNewModule] = useState('');
  // --- NEW STATE ---
  const [newSubtopic, setNewSubtopic] = useState('');

  // Data state
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  // --- NEW STATE ---
  const [subtopics, setSubtopics] = useState([]);
  
  // UI state
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // --- DATA FETCHING LOGIC ---

  const fetchDepartments = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase.from('departments').select('id, name').eq('user_id', profile.id).order('name');
    if (error) console.error('Error fetching departments:', error.message);
    else setDepartments(data);
  }, [profile]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedDepartment) {
        setModules([]);
        // --- MODIFICATION: Clear subtopics when department changes ---
        setSubtopics([]);
        return;
      }
      const { data, error } = await supabase.from('modules').select('id, name').eq('department_id', selectedDepartment).order('name');
      if (error) console.error('Error fetching modules:', error.message);
      else setModules(data);
    };
    fetchModules();
  }, [selectedDepartment]);

  // --- NEW: Fetch Subtopics when a module is selected ---
  useEffect(() => {
    const fetchSubtopics = async () => {
        if (!selectedModule) {
            setSubtopics([]);
            return;
        }
        // Assuming 'user_id' is also on subtopics for RLS, but we filter by module directly
        const { data, error } = await supabase.from('subtopics').select('id, name').eq('module_id', selectedModule).order('name');
        if (error) console.error('Error fetching subtopics:', error.message);
        else setSubtopics(data);
    };
    fetchSubtopics();
  }, [selectedModule]);


  // --- SUBMISSION LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) {
      setStatus('Error: You must be logged in to submit an entry.');
      return;
    }
    setLoading(true);
    setStatus('Submitting...');
    try {
      let departmentId = selectedDepartment;
      if (newDepartment.trim()) {
        const { data: newDeptData, error: newDeptError } = await supabase.from('departments').insert({ name: newDepartment.trim(), user_id: profile.id }).select().single();
        if (newDeptError) throw newDeptError;
        departmentId = newDeptData.id;
      }
      if (!departmentId) throw new Error('A department must be selected or created.');

      let moduleId = selectedModule;
      if (newModule.trim()) {
        // --- MODIFICATION: Must include user_id when creating a module ---
        const { data: newModData, error: newModError } = await supabase.from('modules').insert({ name: newModule.trim(), department_id: departmentId, user_id: profile.id }).select().single();
        if (newModError) throw newModError;
        moduleId = newModData.id;
      }
      if (!moduleId) throw new Error('A module must be selected or created.');

      // --- NEW: Handle Subtopic creation ---
      let subtopicId = selectedSubtopic;
      if (newSubtopic.trim()) {
        const { data: newSubData, error: newSubError } = await supabase.from('subtopics').insert({ name: newSubtopic.trim(), module_id: moduleId, user_id: profile.id }).select().single();
        if (newSubError) throw newSubError;
        subtopicId = newSubData.id;
      }
      // Note: subtopicId can be null, which is fine.

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('learning-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('learning-images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      // --- MODIFICATION: Add subtopic_id to the insert object ---
      const { error: logError } = await supabase.from('learning_logs').insert({ 
        text: text.trim(), 
        user_id: profile.id, 
        department_id: departmentId, 
        module_id: moduleId, 
        // Add the subtopic_id. If none is chosen, this will be null, which is correct.
        subtopic_id: subtopicId || null, 
        image_url: imageUrl 
      });

      if (logError) throw logError;

      setStatus('Learning entry submitted successfully!');
      setText('');
      setImageFile(null);
      handleClearDepartment(); // This will clear everything down the chain
      fetchDepartments(); // Refetch departments to show new ones

    } catch (error) {
      console.error('Submission Error:', error.message);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- CLEAR HANDLERS ---
  const handleClearDepartment = () => {
    setSelectedDepartment('');
    setNewDepartment('');
    setSelectedModule('');
    setNewModule('');
    // --- MODIFICATION: Clear subtopic state as well ---
    setSelectedSubtopic('');
    setNewSubtopic('');
    setModules([]);
    setSubtopics([]);
  };

  const handleClearModule = () => {
    setSelectedModule('');
    setNewModule('');
    // --- MODIFICATION: Clear subtopic state as well ---
    setSelectedSubtopic('');
    setNewSubtopic('');
    setSubtopics([]);
  };

  // --- NEW: Clear handler for Subtopic ---
  const handleClearSubtopic = () => {
    setSelectedSubtopic('');
    setNewSubtopic('');
  };


  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">What I Learned Today</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Department Selection (Unchanged) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">Department</label>
            {(selectedDepartment || newDepartment.trim()) && (<button type="button" onClick={handleClearDepartment} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Clear</button>)}
          </div>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50" disabled={loading || !!newDepartment.trim()}>
            <option value="" disabled>Select a Department</option>
            {departments.map((dep) => (<option key={dep.id} value={dep.id}>{dep.name}</option>))}
          </select>
          <input type="text" value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} placeholder="Or, create a new department" className="w-full p-3 border rounded-md mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 disabled:opacity-50" disabled={loading || !!selectedDepartment} />
        </div>

        {/* Module Selection (CORRECTED LOGIC HERE) */}
        <div className="space-y-2">
           <div className="flex justify-between items-center">
            <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">Module</label>
            {(selectedModule || newModule.trim()) && (<button type="button" onClick={handleClearModule} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Clear</button>)}
          </div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            // FIX IS HERE: The module section is enabled if EITHER a department is selected OR a new one is being typed.
            disabled={loading || !(selectedDepartment || newDepartment.trim()) || !!newModule.trim()}
            className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50"
          >
            <option value="" disabled>Select a Module</option>
            {modules.map((mod) => (<option key={mod.id} value={mod.id}>{mod.name}</option>))}
          </select>
           <input
            type="text"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            placeholder="Or, create a new module"
            // FIX IS HERE: The module section is enabled if EITHER a department is selected OR a new one is being typed.
            disabled={loading || !(selectedDepartment || newDepartment.trim()) || !!selectedModule}
            className="w-full p-3 border rounded-md mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 disabled:opacity-50"
          />
        </div>

         {/* --- NEW: Subtopic Selection --- */}
        <div className="space-y-2">
           <div className="flex justify-between items-center">
            <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">Subtopic (Optional)</label>
            {(selectedSubtopic || newSubtopic.trim()) && (<button type="button" onClick={handleClearSubtopic} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Clear</button>)}
          </div>
          <select
            value={selectedSubtopic}
            onChange={(e) => setSelectedSubtopic(e.target.value)}
            // Enable only when a module is selected or being created
            disabled={loading || !(selectedModule || newModule.trim()) || !!newSubtopic.trim()}
            className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50"
          >
            <option value="" disabled>Select a Subtopic</option>
            {subtopics.map((sub) => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}
          </select>
           <input
            type="text"
            value={newSubtopic}
            onChange={(e) => setNewSubtopic(e.target.value)}
            placeholder="Or, create a new subtopic"
            // Enable only when a module is selected or being created
            disabled={loading || !(selectedModule || newModule.trim()) || !!selectedSubtopic}
            className="w-full p-3 border rounded-md mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 disabled:opacity-50"
          />
        </div>
        
        {/* Rest of the form (Unchanged) */}
        <div className="space-y-2">
          <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">Learning Content</label>
          <textarea required value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe what you learned in detail..." className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400" rows={6} disabled={loading}/>
        </div>
        <div className="space-y-2">
          <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">Reference Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/40 dark:file:text-blue-200 dark:hover:file:bg-blue-900/60" disabled={loading}/>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-400 disabled:opacity-75">
          {loading ? 'Submitting...' : 'Submit Learning Entry'}
        </button>
        {status && <p className="text-sm mt-4 text-center dark:text-gray-300">{status}</p>}
      </form>
    </div>
  );
};

export default LearnTodayPage;