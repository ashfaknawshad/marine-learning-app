import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext'; // Import the useTheme hook
import Logo from './Logo';

// --- Reusable Icons for the Theme Toggle ---
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
);

export default function Auth() {
  // --- Existing State and Logic (No changes here) ---
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { session } = useUser();
  const { theme, toggleTheme } = useTheme(); // Get theme state and toggle function

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    if (isSignUp) {
      // For sign-up, you also need to store the full name
      const { data: { user }, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName // Pass full_name here
          }
        }
      });
      if (error) setError(error.message);
      else setMessage('Signup successful! Please check your email to verify your account.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    // DARK MODE: Updated background color for the whole page
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-blue-50 dark:bg-gray-900 px-4 transition-colors duration-300">

      {/* --- Floating Theme Toggle Button --- */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      {/* DARK MODE: Updated card background color */}
      <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        {/* DARK MODE: Updated heading text color */}
        <h2 className="text-xl font-semibold text-center text-gray-600 dark:text-gray-300 mb-6">
          {isSignUp ? 'Create Your Account' : 'Welcome Back!'}
        </h2>

        <form onSubmit={handleAuthAction} className="space-y-4">
          {isSignUp && (
            // DARK MODE: Updated input field styles
            <input type="text" placeholder="Your Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full p-3 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
          )}
          {/* DARK MODE: Updated input field styles */}
          <input type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
          {/* DARK MODE: Updated input field styles */}
          <input type="password" placeholder="Your Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
          {isSignUp && (
            // DARK MODE: Updated input field styles
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-3 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
          )}
          
          {/* DARK MODE: Updated error/message box styles */}
          {error && <div className="text-center p-2 text-sm text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40 rounded-md">{error}</div>}
          {message && <div className="text-center p-2 text-sm text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40 rounded-md">{message}</div>}
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 transition-colors">
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="text-center mt-6">
          {/* DARK MODE: Updated link button styles */}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} className="text-sm text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
       <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      A Marine Learning App by{' '}
      <a href="https://github.com/ashfaknawshad" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
        Ashfak Nawshad
      </a>
    </p>
    </div>
  );
}