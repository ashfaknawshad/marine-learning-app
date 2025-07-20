import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import { useUser } from '../context/UserContext';

const ProfilePage = () => {
  // 1. Get the new refreshProfile function from our context
  const { session, profile, refreshProfile } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('');
  const [interests, setInterests] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setBirthday(profile.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : '');
      setInterests(profile.interests || '');
      setAvatarUrl(profile.avatar_url);
      setLoading(false);
    }
  }, [profile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updates = {
      id: session.user.id,
      full_name: fullName,
      bio,
      birthday,
      interests,
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      alert('Error updating the data: ' + error.message);
    } else {
      alert('Profile updated successfully!');
      // 2. Call refreshProfile to re-fetch the data from the database
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
      
      // 3. Call refreshProfile here as well to update the navbar avatar
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

  if (loading && !profile) {
    return <div className="text-center text-lg font-semibold">Loading Profile...</div>;
  }
  
  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* ... (The main profile editing form, no changes needed) ... */}
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Your Profile</h1>

  <div className="bg-white p-8 rounded-xl shadow-lg">
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <img 
          src={avatarUrl || `https://api.pravatar.cc/150?u=${session.user.id}`} 
          alt="Profile" 
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <label htmlFor="avatar-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            {uploading ? 'Uploading...' : 'Upload New Avatar'}
          </label>
          <input 
            type="file" 
            id="avatar-upload" 
            className="hidden" 
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
          <p className="text-sm text-gray-500 mt-2">Upload a JPG, PNG, or GIF. Max size 1MB.</p>
        </div>
      </div>
      
      {/* Form Fields */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows="3" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
      </div>
      <div>
        <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">Birthday</label>
        <input type="date" id="birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>
      <div>
        <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests</label>
        <input type="text" id="interests" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g., Cetaceans, Coral Reefs, Conservation" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>

      <div>
        <button type="submit" disabled={loading} className="w-full sm:w-auto bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-400">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>

        {/* --- DANGER ZONE --- */}
        <div className="mt-12 p-6 bg-red-50 border-2 border-dashed border-red-300 rounded-xl">
          <h2 className="text-xl font-bold text-red-800">Danger Zone</h2>
          <p className="text-red-700 mt-1">
            This action is permanent and cannot be undone. This will permanently delete your account, profile, and all associated learning data.
          </p>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full m-4">
            <h2 className="text-2xl font-bold text-gray-900">Are you absolutely sure?</h2>
            <p className="text-gray-600 mt-2">
              This action is irreversible. All your data will be lost. To confirm, please type <strong className="text-red-600">DELETE</strong> in the box below.
            </p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mt-4"
              placeholder="DELETE"
            />
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== 'DELETE' || loading}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
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