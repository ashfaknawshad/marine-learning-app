// LearnTodayPage.jsx

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const LearnTodayPage = () => {
  // --- State Management ---
  // Existing state
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState('');
  
  // New state for departments and modules
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  
  // New state for creating new entries
  const [newDepartment, setNewDepartment] = useState('');
  const [newModule, setNewModule] = useState('');

  // Add this to LearnTodayPage.jsx, right below your other state declarations

useEffect(() => {
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("❗️ No user is logged in. This is why RLS fails.");
      setStatus("❌ You must be logged in to submit entries.");
    } else {
      console.log("✅ User is logged in:", session.user.email);
    }
  };
  checkUser();
}, []);


  // --- Data Fetching ---
  // Fetch all departments on component load
  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase.from('departments').select('id, name');
      if (error) {
        console.error('Error fetching departments:', error.message);
      } else {
        setDepartments(data);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch modules whenever the selected department changes
  useEffect(() => {
    if (selectedDepartment) {
      const fetchModules = async () => {
        const { data, error } = await supabase
          .from('modules')
          .select('id, name')
          .eq('department_id', selectedDepartment);
        if (error) {
          console.error('Error fetching modules:', error.message);
        } else {
          setModules(data);
        }
      };
      fetchModules();
    }
    // Reset module selection when department changes
    setModules([]); 
    setSelectedModule('');
  }, [selectedDepartment]);

  // --- Handlers ---
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setNewDepartment(''); // Clear the 'new department' input
  };

  const handleModuleChange = (e) => {
    setSelectedModule(e.target.value);
    setNewModule(''); // Clear the 'new module' input
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('⏳ Submitting...');

    let departmentId = selectedDepartment;
    let moduleId = selectedModule;

    // --- Logic to Create New Department/Module ---
    try {
      // 1. If a new department is being created
      if (newDepartment) {
        const { data: depData, error: depError } = await supabase
          .from('departments')
          .insert({ name: newDepartment })
          .select('id')
          .single(); // Use .single() to get the new record back
        if (depError) throw depError;
        departmentId = depData.id;
      }

      // 2. If a new module is being created (requires a department)
      if (newModule && departmentId) {
        const { data: modData, error: modError } = await supabase
          .from('modules')
          .insert({ name: newModule, department_id: departmentId })
          .select('id')
          .single();
        if (modError) throw modError;
        moduleId = modData.id;
      }
      
      // Ensure a department and module are selected before proceeding
      if (!departmentId || !moduleId) {
        setStatus('❌ Please select or create a department and module.');
        return;
      }

      // 3. Upload image (if exists)
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('learning-images')
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('learning-images').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      // 4. Insert the learning log
      const { error: insertError } = await supabase.from('learning_logs').insert([
        {
          text,
          image_url: imageUrl,
          department_id: departmentId,
          module_id: moduleId,
          created_at: new Date().toISOString()
        }
      ]);
      if (insertError) throw insertError;

      // --- Success & Reset ---
      setStatus('✅ Submitted successfully!');
      setText('');
      setImageFile(null);
      setSelectedDepartment('');
      setSelectedModule('');
      setNewDepartment('');
      setNewModule('');
      setDepartments([]); // Refetch departments to include the new one
      setModules([]);
    } catch (error) {
      console.error('Submission failed:', error.message);
      setStatus(`❌ Submission failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">What I Learned Today</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Department Selection */}
        <div className="space-y-2">
          <label className="text-lg font-semibold text-gray-700">Department</label>
          <select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="w-full p-3 border rounded-md bg-gray-50"
          >
            <option value="" disabled>Select a Department</option>
            {departments.map((dep) => (
              <option key={dep.id} value={dep.id}>{dep.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newDepartment}
            onChange={(e) => {
              setNewDepartment(e.target.value);
              setSelectedDepartment(''); // Unselect from dropdown
            }}
            placeholder="Or, create a new department"
            className="w-full p-3 border rounded-md mt-2"
          />
        </div>

        {/* Module Selection */}
        <div className="space-y-2">
          <label className="text-lg font-semibold text-gray-700">Module</label>
          <select
            value={selectedModule}
            onChange={handleModuleChange}
            disabled={!selectedDepartment && !newDepartment} // Disable if no department is chosen
            className="w-full p-3 border rounded-md bg-gray-50 disabled:bg-gray-200"
          >
            <option value="" disabled>Select a Module</option>
            {modules.map((mod) => (
              <option key={mod.id} value={mod.id}>{mod.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newModule}
            onChange={(e) => {
              setNewModule(e.target.value);
              setSelectedModule(''); // Unselect from dropdown
            }}
            disabled={!selectedDepartment && !newDepartment}
            placeholder="Or, create a new module"
            className="w-full p-3 border rounded-md mt-2 disabled:bg-gray-200"
          />
        </div>

        {/* Learning Text Area */}
        <div className="space-y-2">
          <label className="text-lg font-semibold text-gray-700">Learning Content</label>
          <textarea
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you learned in detail. This will be used to generate flashcards later."
            className="w-full p-3 border rounded-md"
            rows={6}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-lg font-semibold text-gray-700">Reference Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Submit Learning Entry
        </button>

        {status && <p className="text-sm mt-4 text-center">{status}</p>}
      </form>
    </div>
  );
};

export default LearnTodayPage;