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
    longitude: '',
    qualification: '',
    country: '',
    gender: '',
    coursename: [],
    courseCode: [],
    rating: 0,
    status: '',
    isVerified: false,
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    qualification: '',
    address: '',
    profileImage: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/teachers/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
      setProfile(result.data);
        setPreviewImage(result.data.profileImage ? (result.data.profileImage.startsWith('http') ? result.data.profileImage : `${import.meta.env.VITE_BACKEND_BASE_URL}${result.data.profileImage}`) : '');
        
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
          Teacher Profile
        </h1>
        <p style={{ color: theme.colors.textSecondary }}>
          Manage your teacher profile information
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6" style={{ borderColor: theme.colors.border }}>
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
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50" style={{ borderColor: theme.colors.border }}>
                {profile.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Email Address
              </label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50" style={{ borderColor: theme.colors.border }}>
                {profile.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Mobile Number
              </label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50" style={{ borderColor: theme.colors.border }}>
                {profile.mobile}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Address
              </label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50" style={{ borderColor: theme.colors.border }}>
                {profile.address}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Gender
              </label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50" style={{ borderColor: theme.colors.border }}>
                {profile.gender}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Qualification
              </label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50" style={{ borderColor: theme.colors.border }}>
                {profile.qualification}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Country
              </label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50" style={{ borderColor: theme.colors.border }}>
                {profile.country}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Courses
              </label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50" style={{ borderColor: theme.colors.border }}>
                {profile.coursename && profile.coursename.length > 0 ? profile.coursename.join(', ') : 'No courses assigned'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Rating
              </label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50" style={{ borderColor: theme.colors.border }}>
                {profile.rating}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Status
              </label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50" style={{ borderColor: theme.colors.border }}>
                {profile.status}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditData({
                qualification: profile.qualification || '',
                address: profile.address || '',
                profileImage: null
              });
              setIsModalOpen(true);
            }}
            className="px-6 py-2 text-white rounded-md font-medium transition"
            style={{ backgroundColor: theme.colors.primary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.primaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.primary}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
              Edit Profile
            </h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);

              try {
                const token = localStorage.getItem('token');
                const formData = new FormData();

                formData.append('qualification', editData.qualification);
                formData.append('address', editData.address);
                if (editData.profileImage) {
                  formData.append('profileImage', editData.profileImage);
                }

                const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/teachers/profile`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  },
                  body: formData
                });

                if (response.ok) {
                  const result = await response.json();
                  setProfile(prev => ({
                    ...prev,
                    qualification: result.data.qualification,
                    address: result.data.address,
                    profileImage: result.data.profileImage
                  }));
                  setPreviewImage(result.data.profileImage ? (result.data.profileImage.startsWith('http') ? result.data.profileImage : `${import.meta.env.VITE_BACKEND_BASE_URL}${result.data.profileImage}`) : previewImage);
                  setIsModalOpen(false);
                  toast.success('Profile updated successfully!');
                } else {
                  toast.error('Failed to update profile');
                }
              } catch (error) {
                toast.error('Error updating profile');
              } finally {
                setSaving(false);
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setEditData(prev => ({ ...prev, profileImage: file }));
                  }}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
                  style={{ borderColor: theme.colors.border }}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData.qualification}
                  onChange={(e) => setEditData(prev => ({ ...prev, qualification: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
                  style={{ borderColor: theme.colors.border }}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editData.address}
                  onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
                  style={{ borderColor: theme.colors.border }}
                  rows="3"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md font-medium transition"
                  style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-white rounded-md font-medium transition disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
