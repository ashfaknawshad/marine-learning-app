// src/context/UserContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabaseClient';

export const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // 1. Add loading state, default to true

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        setSession(currentSession);

        if (sessionError) {
          throw sessionError;
        }

        // If there is a session, fetch the corresponding profile
        if (currentSession) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error in session/profile fetch:', error);
      } finally {
        setLoading(false); // 2. Set loading to false after all checks are done
      }
    };

    fetchSessionAndProfile();

    // Set up a listener for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // You might want to re-fetch the profile here as well if the user changes
      if (!newSession) {
        setProfile(null);
      } else {
        fetchSessionAndProfile(); // Re-fetch all data on auth change
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 3. Expose the loading state in the context value
  const value = {
    session,
    profile,
    loading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};