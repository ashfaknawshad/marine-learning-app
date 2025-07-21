// src/components/DataManager.jsx

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const DataManager = () => {
  const [departments, setDepartments] = useState([]);

  // This is a simplified fetcher. Yours might be more complex.
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        id, name,
        modules (id, name)
      `)
      .order('name');
    
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setDepartments(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    // DARK MODE: Added dark:bg-gray-800 for the card background
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      {/* DARK MODE: Added dark:text-white for the heading */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Manage Departments & Modules
      </h2>
      <div className="space-y-4">
        {departments.map((dept) => (
          // DARK MODE: Added dark mode classes for each list item
          <div key={dept.id} className="p-4 rounded-md border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              {/* DARK MODE: Changed department name text color */}
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{dept.name}</h3>
              <div>
                <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mr-3">Edit</button>
                <button className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button>
              </div>
            </div>
            <div className="mt-2 pl-4">
              {dept.modules.map((mod) => (
                <div key={mod.id} className="flex justify-between items-center py-1">
                  {/* DARK MODE: Changed module name text color */}
                  <p className="text-gray-700 dark:text-gray-300">{mod.name}</p>
                   <div>
                    <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mr-3">Edit</button>
                    <button className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataManager;