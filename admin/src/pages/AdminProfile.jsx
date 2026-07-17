import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { theme } from '../theme';

const AdminProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    profileImage: '',
    lattitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/superadmin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        const img = data.profileImage;
        setPreviewImage(img ? (img.startsWith('http') ? img : `${import.meta.env.VITE_BACKEND_BASE_URL}/${img}`) : '');
      } else {
        toast.error('Failed to fetch profile data');
      }
    } catch (error) {
      toast.error('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Add all profile fields except profileImage
      Object.keys(profile).forEach(key => {
        if (key !== 'profileImage') {
          formData.append(key, profile[key]);
        }
      });

      // Add the selected file if any
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/superadmin/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedData = await response.json();
        const updatedProfile = updatedData.profile || updatedData;
        setProfile(updatedProfile);
        const img = updatedProfile.profileImage;
        setPreviewImage(img ? (img.startsWith('http') ? img : `${import.meta.env.VITE_BACKEND_BASE_URL}/${img}`) : '');
        setSelectedFile(null);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg" style={{ color: theme.colors.textSecondary }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
          Admin Profile
        </h1>
        <p style={{ color: theme.colors.textSecondary }}>
          Manage your superadmin profile information
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6" style={{ borderColor: theme.colors.border }}>
        <form onSubmit={handleSubmit}>
          {/* Profile Image Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
              Profile Picture
            </h2>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-2xl font-bold" style={{ color: theme.colors.textSecondary }}>
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="profileImage"
                />
                <label
                  htmlFor="profileImage"
                  className="cursor-pointer px-4 py-2 rounded-md text-white font-medium transition"
                  style={{ backgroundColor: theme.colors.primary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.primary}
                >
                  Change Picture
                </label>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  Full Name
                </label>
                <label  className="w-full px-4 py-2 rounded-md focus:ring-2 focus:outline-none">
                    {profile.name}
                </label>
                </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  Email Address
                </label>
                <label  className="w-full px-4 py-2  rounded-md focus:ring-2 focus:outline-none"> {profile.email}</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  Mobile Number
                </label>
                <label  className="w-full px-4 py-2  rounded-md focus:ring-2 focus:outline-none">
                    {profile.mobile}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  Address
                </label>
                <label  className="w-full px-4 py-2  rounded-md focus:ring-2 focus:outline-none">
                    {profile.address}
                </label>
              </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 border rounded-md font-medium transition"
              style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-white rounded-md font-medium transition disabled:opacity-50"
              style={{ backgroundColor: theme.colors.primary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.primaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.primary}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
