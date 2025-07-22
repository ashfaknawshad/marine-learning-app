// src/components/DataManager.jsx

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import { useUser } from '../context/UserContext';
import EditModal from './EditModal'; // <-- IMPORT THE NEW MODAL

const DataManager = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUser();
  
  // NEW STATE: To manage which item is being edited
  const [editingItem, setEditingItem] = useState(null); 

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, modules(id, name)')
      .eq('user_id', profile.id)
      .order('name');
    
    if (error) {
      console.error('Error fetching data:', error.message);
    } else {
      setDepartments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  // --- HANDLER FUNCTIONS ---

  const handleDelete = async (type, id) => {
    const table = type === 'department' ? 'departments' : 'modules';
    const confirmationMessage = type === 'department'
      ? 'Are you sure you want to delete this department and all its modules?'
      : 'Are you sure you want to delete this module?';

    if (!window.confirm(confirmationMessage)) return;

    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      console.error(`Error deleting ${type}:`, error.message);
      alert(`Failed to delete ${type}.`);
    } else {
      fetchData();
    }
  };

  // UPDATED: This function now opens the modal
  const handleEdit = (type, item) => {
    setEditingItem({ ...item, type });
  };

  // NEW: This function saves the changes from the modal
  const handleUpdate = async (newName) => {
    if (!editingItem || !newName.trim()) {
      setEditingItem(null);
      return;
    }
    
    const table = editingItem.type === 'department' ? 'departments' : 'modules';

    const { error } = await supabase
      .from(table)
      .update({ name: newName.trim() }) // The new data
      .eq('id', editingItem.id);       // Which row to update

    if (error) {
      console.error(`Error updating ${editingItem.type}:`, error.message);
      alert('Failed to update. Please try again.');
    } else {
      fetchData(); // Refresh the data to show the new name
    }

    setEditingItem(null); // Close the modal
  };
  
  // ( ... loading and empty states remain the same ... )
  if (loading) { /* ... */ }
  if (!loading && departments.length === 0) { /* ... */ }

  return (
    <> {/* Use a fragment to wrap the modal and the main div */}
      {/* Conditionally render the modal when 'editingItem' is not null */}
      {editingItem && (
        <EditModal 
          item={editingItem}
          onClose={() => setEditingItem(null)} // Function to close the modal
          onSave={handleUpdate}                 // Function to save changes
        />
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Manage Departments & Modules
        </h2>
        <div className="space-y-4">
          {departments.map((dept) => (
            <div key={dept.id} className="p-4 rounded-md border-b dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{dept.name}</h3>
                <div>
                  <button 
                    onClick={() => handleEdit('department', dept)} // Pass the whole object
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete('department', dept.id)} // Pass type and ID
                    className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-2 pl-4">
                {dept.modules.map((mod) => (
                  <div key={mod.id} className="flex justify-between items-center py-1">
                    <p className="text-gray-700 dark:text-gray-300">{mod.name}</p>
                     <div>
                      <button 
                        onClick={() => handleEdit('module', mod)} // Pass the whole object
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete('module', mod.id)} // Pass type and ID
                        className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DataManager;