// src/components/DataManager.jsx

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const DataManager = () => {
  const [data, setData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [newName, setNewName] = useState('');

  // Function to fetch data owned by the current user
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Don't fetch if no user is logged in

    const { data: departments, error } = await supabase
      .from('departments')
      .select(`
        id, name,
        modules ( id, name )
      `)
      .eq('user_id', user.id) // Ensure we only get the user's own departments
      .order('name');
      
    if (error) {
      console.error('Error fetching data:', error);
      alert('Could not fetch your departments. Check the console for errors.');
    } else {
      setData(departments);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (type, id) => {
    const table = type === 'department' ? 'departments' : 'modules';
    const confirmation = window.confirm(`Are you sure you want to delete this ${type}? This can't be undone.`);

    if (confirmation) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        alert(`Error deleting ${type}: ${error.message}`);
      } else {
        fetchData();
      }
    }
  };

  const handleEdit = (type, item) => {
    setEditingItem({ type, id: item.id });
    setNewName(item.name);
  };
  
  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewName('');
  };

  const handleSaveEdit = async () => {
    if (!newName.trim()) return;
    const table = editingItem.type === 'department' ? 'departments' : 'modules';
    const { error } = await supabase
      .from(table)
      .update({ name: newName.trim() })
      .eq('id', editingItem.id);

    if (error) {
      alert(`Error updating ${editingItem.type}: ${error.message}`);
    } else {
      handleCancelEdit();
      fetchData();
    }
  };

  // If there's no data yet, show a helpful message
  if (data.length === 0) {
    return (
       <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-2xl font-bold mb-4">Manage Departments & Modules</h2>
        <p className="text-gray-500">You haven't created any departments yet. Go to the "What I Learned" page to add your first one!</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Manage Departments & Modules</h2>
      <div className="space-y-4">
        {data.map((dept) => (
          <div key={dept.id} className="p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              {editingItem?.id === dept.id ? (
                <input
                  type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="p-2 border rounded-md text-xl font-semibold" autoFocus
                />
              ) : (
                <h3 className="text-xl font-semibold text-blue-800">{dept.name}</h3>
              )}
              <div className="space-x-3">
                {editingItem?.id === dept.id ? (
                   <>
                    <button onClick={handleSaveEdit} className="font-semibold text-green-600 hover:text-green-800">Save</button>
                    <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700">Cancel</button>
                   </>
                ) : (
                  <>
                    <button onClick={() => handleEdit('department', dept)} className="font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete('department', dept.id)} className="font-semibold text-red-600 hover:text-red-800">Delete</button>
                  </>
                )}
              </div>
            </div>
            
            <ul className="mt-4 ml-6 space-y-3">
              {dept.modules.map((mod) => (
                <li key={mod.id} className="flex justify-between items-center text-gray-800">
                   {editingItem?.id === mod.id ? (
                    <input
                      type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                      className="p-1 border rounded-md" autoFocus
                    />
                  ) : (
                    <span>{mod.name}</span>
                  )}
                  <div className="space-x-3">
                    {editingItem?.id === mod.id ? (
                      <>
                        <button onClick={handleSaveEdit} className="font-semibold text-green-600 hover:text-green-800">Save</button>
                        <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit('module', mod)} className="font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                        <button onClick={() => handleDelete('module', mod.id)} className="font-semibold text-red-600 hover:text-red-800">Delete</button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataManager;