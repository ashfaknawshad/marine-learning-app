// src/pages/LearnTodayPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import supabase from '../supabaseClient';
import { useUser } from '../context/UserContext';

const LearnTodayPage = () => {
  const { profile } = useUser();

  // Form state
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newModule, setNewModule] = useState('');

  // Data state
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  
  // UI state
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // --- DATA FETCHING LOGIC (Unchanged) ---

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
        return;
      }
      const { data, error } = await supabase.from('modules').select('id, name').eq('department_id', selectedDepartment).order('name');
      if (error) console.error('Error fetching modules:', error.message);
      else setModules(data);
    };
    fetchModules();
  }, [selectedDepartment]);

  // --- SUBMISSION LOGIC (Unchanged) ---

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
        const { data: newModData, error: newModError } = await supabase.from('modules').insert({ name: newModule.trim(), department_id: departmentId }).select().single();
        if (newModError) throw newModError;
        moduleId = newModData.id;
      }
      if (!moduleId) throw new Error('A module must be selected or created.');
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('learning-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('learning-images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
      const { error: logError } = await supabase.from('learning_logs').insert({ text: text.trim(), user_id: profile.id, department_id: departmentId, module_id: moduleId, image_url: imageUrl });
      if (logError) throw logError;
      setStatus('Learning entry submitted successfully!');
      setText('');
      setImageFile(null);
      handleClearDepartment();
      fetchDepartments();
    } catch (error) {
      console.error('Submission Error:', error.message);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- CLEAR HANDLERS (Unchanged) ---

  const handleClearDepartment = () => {
    setSelectedDepartment('');
    setNewDepartment('');
    setSelectedModule('');
    setNewModule('');
    setModules([]);
  };

  const handleClearModule = () => {
    setSelectedModule('');
    setNewModule('');
  };

  // --- FINAL JSX WITH CORRECTED LOGIC ---

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