import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import { useNavigate } from 'react-router-dom'; // 2. Import useNavigate
import supabase from '../supabaseClient';
import { useUser } from '../context/UserContext'; // 3. Import useUser to access the session
import Logo from './Logo';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 4. Get the navigate function and the session from our hooks
  const navigate = useNavigate();
  const { session } = useUser();

  // 5. This is the FIX. This effect runs whenever the 'session' object changes.
  useEffect(() => {
    // If a session is detected, the user is logged in.
    // Redirect them from the auth page to the dashboard.
    if (session) {
      navigate('/');
    }
  }, [session, navigate]); // The effect depends on session and navigate

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
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Signup successful! Please check your email to verify your account.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      // On successful sign-in, the useEffect hook above will now handle the navigation.
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4">
      <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-600 mb-6">
          {isSignUp ? 'Create Your Account' : 'Welcome Back!'}
        </h2>

        <form onSubmit={handleAuthAction} className="space-y-4">
          {/* ... all the input fields (no changes here) ... */}
          {isSignUp && (
            <input type="text" placeholder="Your Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full p-3 border-gray-300 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          )}
          <input type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border-gray-300 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          <input type="password" placeholder="Your Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border-gray-300 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          {isSignUp && (
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-3 border-gray-300 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          )}
          
          {error && <div className="text-center p-2 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
          {message && <div className="text-center p-2 text-sm text-green-700 bg-green-100 rounded-md">{message}</div>}
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} className="text-sm text-blue-600 hover:underline">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}