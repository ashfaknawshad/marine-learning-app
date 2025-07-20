import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'; // 1. Import useCallback
import supabase from '../supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // 2. Create the function to fetch the profile
  const fetchProfile = useCallback(async (user) => {
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Get initial session and profile
    const getInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      await fetchProfile(session?.user);
    };

    getInitialData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchProfile(session?.user);
    });
    
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // 3. This is the new function we will provide to other components
  const refreshProfile = useCallback(() => {
    if(session?.user) {
      fetchProfile(session.user);
    }
  }, [session, fetchProfile]);

  const value = { session, profile, loading, refreshProfile }; // 4. Add refreshProfile to the context value

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};