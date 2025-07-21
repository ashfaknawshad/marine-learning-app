import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import { useUser } from '../context/UserContext';

// Note: I'm not importing useNavigate as your logic handles UI updates via alerts and refreshes.

const ProfilePage = () => {
  // --- Existing State & Context ---
  const { session, profile, refreshProfile } = useUser();
  
  const [loading, setLoading] = useState(false); // Used for form submission/deletion
  const [uploading, setUploading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('');
  const [interests, setInterests] = useState('');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // --- Logic to populate form from profile ---
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setBirthday(profile.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : '');
      setInterests(profile.interests || '');
    }
  }, [profile]);

  // --- Handlers from your original code ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updates = { id: session.user.id, full_name: fullName, bio, birthday, interests };
    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) alert('Error updating the data: ' + error.message);
    else {
      alert('Profile updated successfully!');
      if (refreshProfile) refreshProfile();
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('You must select an image.');
      const user = session.user;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl });
      if (updateError) throw updateError;
      if (refreshProfile) refreshProfile();
      alert('Avatar updated successfully!');
    } catch (error) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') return alert("Please type 'DELETE' to confirm.");
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) throw error;
      alert('Your account has been successfully deleted.');
      await supabase.auth.signOut();
    } catch (error) {
      alert('Error deleting account: ' + error.message);
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  // --- Loading State UI ---
  // If the profile hasn't loaded from the context yet, show a message.
  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-xl font-semibold dark:text-white">Loading Profile...</p>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* --- Main Profile Card --- */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Edit Your Profile</h1>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* --- Avatar Section (New UI) --- */}
            <div className="flex items-center space-x-6">
              <img 
                src={profile.avatar_url || `https://api.pravatar.cc/150?u=${session.user.id}`} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
              />
              <div>
                <label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {uploading ? 'Uploading...' : 'Change Avatar'}
                </label>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/40 dark:file:text-blue-200 dark:hover:file:bg-blue-900/60"
                />
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Max size 1MB.</p>
              </div>
            </div>
            
            {/* --- Form Fields (Styled for Dark Mode) --- */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full p-3 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows="3" className="mt-1 block w-full p-3 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birthday</label>
              <input type="date" id="birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="mt-1 block w-full p-3 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
            </div>
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interests</label>
              <input type="text" id="interests" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g., Cetaceans, Coral Reefs" className="mt-1 block w-full p-3 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"/>
            </div>

            {/* --- Save Button (Blue) --- */}
            <div>
              <button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* --- Danger Zone (Styled for Dark Mode) --- */}
        <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-500/30">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-300">Danger Zone</h2>
            <p className="text-red-700 dark:text-red-400 mt-1">
              This will permanently delete your account and all associated data.
            </p>
            <button onClick={() => setIsDeleteModalOpen(true)} className="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
              Delete My Account
            </button>
        </div>
      </div>

      {/* --- Delete Confirmation Modal (Styled for Dark Mode) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Are you absolutely sure?</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              This action is irreversible. To confirm, type <strong className="text-red-600 dark:text-red-400">DELETE</strong> below.
            </p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="w-full mt-4 p-3 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="DELETE"
            />
            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== 'DELETE' || loading}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;