// src/components/DataManager.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { FiChevronRight, FiChevronDown, FiTrash2, FiEdit } from 'react-icons/fi'; // Added FiEdit

const DataManager = () => {
  const { profile } = useUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for UI interactions
  const [openItems, setOpenItems] = useState({});
  const [editingItem, setEditingItem] = useState(null); // e.g., { id: 1, name: 'Old Name', tableName: 'departments' }

  // --- DATA FETCHING (Unchanged) ---
  const fetchData = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const { data: departmentData, error } = await supabase
      .from('departments')
      .select('id, name, modules (id, name, subtopics (id, name))')
      .eq('user_id', profile.id)
      .order('name', { ascending: true })
      .order('name', { foreignTable: 'modules', ascending: true })
      .order('name', { foreignTable: 'modules.subtopics', ascending: true });

    if (error) console.error('Error fetching managed data:', error.message);
    else setData(departmentData);
    
    setLoading(false);
  }, [profile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- UI HANDLERS ---
  const toggleItem = (id) => setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  
  const handleEdit = (item, tableName, event) => {
    event.stopPropagation(); // Prevent accordion from toggling when clicking edit
    setEditingItem({ id: item.id, name: item.name, tableName });
  };

  const handleCancelEdit = (event) => {
    if (event) event.stopPropagation();
    setEditingItem(null);
  };
  
  const handleSave = async (event) => {
    event.stopPropagation();
    if (!editingItem?.name.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from(editingItem.tableName)
      .update({ name: editingItem.name.trim() })
      .eq('id', editingItem.id);

    if (error) {
      alert(`Error updating item: ${error.message}`);
    } else {
      setEditingItem(null); // Exit edit mode
      await fetchData(); // Refresh data to show the change
    }
    setLoading(false);
  };

  const handleDelete = async (tableName, id, event) => {
    event.stopPropagation(); // Prevent accordion from toggling
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to delete this item? This will also delete all items nested under it.')) {
      setLoading(true);
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) alert(`Error deleting item: ${error.message}`);
      else await fetchData();
      setLoading(false);
    }
  };

  // --- RENDER LOGIC ---
  if (loading && data.length === 0) return <p className="dark:text-gray-400">Loading your data...</p>;
  if (!loading && data.length === 0) return (
    <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-xl font-semibold dark:text-white">Nothing here yet!</h3>
      <p className="text-gray-500 dark:text-gray-400 mt-2">Go to the "Learn Today" page to create your first Department.</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
      {loading && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 animate-pulse rounded-lg z-10"></div>}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Your Study Hierarchy</h2>
      <ul className="space-y-2">
        {data.map(dept => (
          <li key={dept.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1">
            {/* Department Level */}
            <div onClick={() => toggleItem(`dept-${dept.id}`)} className="flex items-center justify-between p-3 cursor-pointer">
              <div className="flex items-center flex-grow">
                <span className="mr-2 text-gray-500 dark:text-gray-400">
                  {dept.modules.length > 0 ? (openItems[`dept-${dept.id}`] ? <FiChevronDown /> : <FiChevronRight />) : <span className="w-4 inline-block"></span>}
                </span>
                {editingItem?.id === dept.id ? (
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                    className="py-1 px-2 rounded-md border-blue-500 border bg-white dark:bg-gray-600 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <span className="font-bold text-lg text-gray-800 dark:text-gray-100">{dept.name}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                {editingItem?.id === dept.id ? (
                  <>
                    <button onClick={handleSave} className="text-green-500 hover:text-green-400 p-1 rounded-md transition-colors font-semibold text-sm">Save</button>
                    <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-400 p-1 rounded-md transition-colors font-semibold text-sm">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => handleEdit(dept, 'departments', e)} className="hover:text-blue-500 p-1 rounded-md transition-colors"><FiEdit /></button>
                    <button onClick={(e) => handleDelete('departments', dept.id, e)} className="hover:text-red-500 p-1 rounded-md transition-colors"><FiTrash2 /></button>
                  </>
                )}
              </div>
            </div>

            {/* Module Level */}
            {openItems[`dept-${dept.id}`] && dept.modules.length > 0 && (
              <ul className="space-y-1 pl-8 pr-2 pb-2">
                {dept.modules.map(mod => (
                  <li key={mod.id} className="bg-white dark:bg-gray-700 rounded-md">
                    <div onClick={() => toggleItem(`mod-${mod.id}`)} className="flex items-center justify-between p-2 cursor-pointer">
                      <div className="flex items-center flex-grow">
                         <span className="mr-2 text-gray-500 dark:text-gray-400">
                          {mod.subtopics.length > 0 ? (openItems[`mod-${mod.id}`] ? <FiChevronDown /> : <FiChevronRight />) : <span className="w-4 inline-block"></span>}
                        </span>
                         {editingItem?.id === mod.id ? (
                           <input
                            type="text"
                            value={editingItem.name}
                            onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                            className="py-1 px-2 rounded-md border-blue-500 border bg-white dark:bg-gray-600 dark:text-white"
                            autoFocus
                           />
                         ) : (
                           <span className="font-semibold text-gray-700 dark:text-gray-200">{mod.name}</span>
                         )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        {editingItem?.id === mod.id ? (
                          <>
                            <button onClick={handleSave} className="text-green-500 hover:text-green-400 p-1 rounded-md transition-colors font-semibold text-sm">Save</button>
                            <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-400 p-1 rounded-md transition-colors font-semibold text-sm">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={(e) => handleEdit(mod, 'modules', e)} className="hover:text-blue-500 p-1 rounded-md transition-colors"><FiEdit /></button>
                            <button onClick={(e) => handleDelete('modules', mod.id, e)} className="hover:text-red-500 p-1 rounded-md transition-colors"><FiTrash2 /></button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Subtopic Level */}
                    {openItems[`mod-${mod.id}`] && mod.subtopics.length > 0 && (
                      <ul className="space-y-1 pl-10 pr-2 pb-2">
                        {mod.subtopics.map(sub => (
                          <li key={sub.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600/50">
                            {editingItem?.id === sub.id ? (
                              <>
                                <input
                                  type="text"
                                  value={editingItem.name}
                                  onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                                  onClick={(e) => e.stopPropagation()}
                                  className="py-1 px-2 rounded-md border-blue-500 border bg-white dark:bg-gray-600 dark:text-white w-full"
                                  autoFocus
                                />
                                <div className="flex items-center gap-2 ml-2">
                                    <button onClick={handleSave} className="text-green-500 hover:text-green-400 p-1 rounded-md transition-colors font-semibold text-sm">Save</button>
                                    <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-400 p-1 rounded-md transition-colors font-semibold text-sm">Cancel</button>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="text-gray-600 dark:text-gray-300">{sub.name}</span>
                                <div className="flex items-center gap-2 text-gray-400">
                                  <button onClick={(e) => handleEdit(sub, 'subtopics', e)} className="hover:text-blue-500 p-1 rounded-md transition-colors"><FiEdit /></button>
                                  <button onClick={(e) => handleDelete('subtopics', sub.id, e)} className="hover:text-red-500 p-1 rounded-md transition-colors"><FiTrash2 /></button>
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataManager;