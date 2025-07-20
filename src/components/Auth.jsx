import React, { useState } from 'react';
import supabase from '../supabaseClient';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.error_description || error.message);
    }
    setLoading(false);
  };
  
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.error_description || error.message);
    } else {
      alert('Signup successful! Please check your email to verify your account.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Marine Learning App</h1>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-md"
          />
          <input
            type="password"
            placeholder="Your password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-md"
          />
          <div className="flex space-x-4">
            <button 
              onClick={handleLogin} 
              disabled={loading} 
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <button 
              onClick={handleSignup} 
              disabled={loading} 
              className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;