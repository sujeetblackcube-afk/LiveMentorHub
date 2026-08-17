import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { theme } from '../theme';
import { getImageUrl } from '../utils/image';

const AdminProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: '',
    whatsappNumber: '',
    address: '',
    profileImage: '',
    lattitude: '',
    longitude: '',
    qualification: '',
    specialization: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    coursename: [],
    courseCode: [],
    totalExperience: '',
    relevantExperience: '',
    subjectsToTeach: '',
    classesToTeach: '',
    preferredCurriculum: 'CBSE',
    modeOfTeaching: 'One-on-One (Individual)',
    platforms: [],
    availability: '',
    internetConnectivity: 'High-Speed Broadband',
    requiredSetup: [],
    individualFee: '',
    batchFee: '',
    preferredPaymentMode: 'Bank Transfer',
    preferredLocation: '',
    languages: '',
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
    name: '',
    gender: '',
    age: '',
    dateOfBirth: '',
    qualification: '',
    specialization: '',
    address: '',
    mobile: '',
    whatsappNumber: '',
    email: '',
    totalExperience: '',
    relevantExperience: '',
    subjectsToTeach: '',
    classesToTeach: '',
    preferredCurriculum: '',
    modeOfTeaching: '',
    platforms: [],
    availability: '',
    internetConnectivity: '',
    requiredSetup: [],
    individualFee: '',
    batchFee: '',
    preferredPaymentMode: '',
    preferredLocation: '',
    languages: '',
    profileImage: null,
    idProof: null,
    qualificationCertificates: null,
    experienceCertificates: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/teacher/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(result.data);
        setPreviewImage(getImageUrl(result.data.profileImage, ''));
      } else {
        toast.error('Failed to fetch profile data');
      }
    } catch (error) {
      toast.error('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxGroupChange = (field, value) => {
    setEditData(prev => {
      const currentList = prev[field] || [];
      if (currentList.includes(value)) {
        return { ...prev, [field]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...currentList, value] };
      }
    });
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
                <img
                  src={getImageUrl(previewImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://res.cloudinary.com/tivvs1hg/image/upload/v1784356473/banners/owvuikvq07d3nldssn5h.jpg";
                  }}
                />
              ) : (
                <div className="text-2xl font-bold" style={{ color: theme.colors.textSecondary }}>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>Full Name</label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50">{profile.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>Email Address</label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50">{profile.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>Contact Number</label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50">{profile.mobile}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>WhatsApp Number</label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50">{profile.whatsappNumber || profile.mobile}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>Address</label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50">{profile.address}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>Gender</label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50">{profile.gender}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>Qualification</label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50">{profile.qualification}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>Specialization</label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50">{profile.specialization || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditData({
                name: profile.name || '',
                gender: profile.gender || '',
                age: profile.age || '',
                dateOfBirth: profile.dateOfBirth || '',
                qualification: profile.qualification || '',
                specialization: profile.specialization || '',
                address: profile.address || '',
                mobile: profile.mobile || '',
                whatsappNumber: profile.whatsappNumber || '',
                email: profile.email || '',
                totalExperience: profile.totalExperience || '',
                relevantExperience: profile.relevantExperience || '',
                subjectsToTeach: profile.subjectsToTeach || '',
                classesToTeach: profile.classesToTeach || '',
                preferredCurriculum: profile.preferredCurriculum || 'CBSE',
                modeOfTeaching: profile.modeOfTeaching || 'One-on-One (Individual)',
                platforms: profile.platforms || [],
                availability: profile.availability || '',
                internetConnectivity: profile.internetConnectivity || 'High-Speed Broadband',
                requiredSetup: profile.requiredSetup || [],
                individualFee: profile.individualFee || '',
                batchFee: profile.batchFee || '',
                preferredPaymentMode: profile.preferredPaymentMode || 'Bank Transfer',
                preferredLocation: profile.preferredLocation || '',
                languages: profile.languages || '',
                profileImage: null,
                idProof: null,
                qualificationCertificates: null,
                experienceCertificates: null
              });
              setIsModalOpen(true);
            }}
            className="px-6 py-2 text-white rounded-md font-medium transition"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b" style={{ color: theme.colors.textPrimary }}>
              Edit Teacher Profile
            </h2>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);

              try {
                const token = localStorage.getItem('token');
                const formData = new FormData();

                // Append all text/select fields
                Object.keys(editData).forEach(key => {
                  if (!['profileImage', 'idProof', 'qualificationCertificates', 'experienceCertificates'].includes(key)) {
                    if (Array.isArray(editData[key])) {
                      formData.append(key, JSON.stringify(editData[key]));
                    } else if (editData[key] !== null && editData[key] !== undefined) {
                      formData.append(key, editData[key]);
                    }
                  }
                });

                // Append files if selected
                if (editData.profileImage) formData.append('profileImage', editData.profileImage);
                if (editData.idProof) formData.append('idProof', editData.idProof);
                if (editData.qualificationCertificates) formData.append('qualificationCertificates', editData.qualificationCertificates);
                if (editData.experienceCertificates) formData.append('experienceCertificates', editData.experienceCertificates);

                const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/teacher/profile`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  },
                  body: formData
                });

                if (response.ok) {
                  const result = await response.json();
                  setProfile(result.data);
                  if (result.data.profileImage) {
                    setPreviewImage(getImageUrl(result.data.profileImage, previewImage));
                  }
                  setIsModalOpen(false);
                  toast.success('Profile updated successfully!');
                  window.dispatchEvent(new Event('profileUpdated'));
                } else {
                  toast.error('Failed to update profile');
                }
              } catch (error) {
                toast.error('Error updating profile');
              } finally {
                setSaving(false);
              }
            }}>

              {/* 1. PERSONAL INFORMATION */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-1">1. Personal Information</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <div className="flex space-x-6 mt-2">
                    {['Male', 'Female', 'Other'].map(gen => (
                      <label key={gen} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={gen}
                          checked={editData.gender === gen}
                          onChange={handleEditChange}
                        />
                        <span>{gen}</span>
                      </label>
                    ))}
                  </div>
                </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      min="0"
                      value={editData.age}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || Number(value) >= 0) {
                          handleEditChange(e);
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      max={new Date().toISOString().split('T')[0]}
                      value={editData.dateOfBirth}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Qualification(s)</label>
                    <input
                      type="text"
                      name="qualification"
                      value={editData.qualification}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={editData.specialization}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    name="address"
                    value={editData.address}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Number</label>
                    <input
                      type="text"
                      name="mobile"
                      value={editData.mobile}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={editData.whatsappNumber}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* 2. PROFESSIONAL DETAILS */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-1">2. Professional Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Teaching Experience</label>
                    <input
                      type="text"
                      name="totalExperience"
                      value={editData.totalExperience}
                      onChange={handleEditChange}
                      placeholder="e.g., 5 years"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Relevant Experience (Subject/Class)</label>
                    <input
                      type="text"
                      name="relevantExperience"
                      value={editData.relevantExperience}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Subjects You Can Teach</label>
                    <input
                      type="text"
                      name="subjectsToTeach"
                      value={editData.subjectsToTeach}
                      onChange={handleEditChange}
                      placeholder="e.g., Mathematics, Science"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Classes/Grades You Can Teach</label>
                    <input
                      type="text"
                      name="classesToTeach"
                      value={editData.classesToTeach}
                      onChange={handleEditChange}
                      placeholder="e.g., 6th to 10th Grade"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Curriculum</label>
                  <select
                    name="preferredCurriculum"
                    value={editData.preferredCurriculum}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="IGCSE">IGCSE</option>
                    <option value="IB">IB</option>
                    <option value="State Board">State Board</option>
                  </select>
                </div>
              </div>

              {/* 3. ONLINE TEACHING DETAILS */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-1">3. Online Teaching Details</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Mode of Teaching</label>
                  <select
                    name="modeOfTeaching"
                    value={editData.modeOfTeaching}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="One-on-One (Individual)">One-on-One (Individual)</option>
                    <option value="Batch Classes">Batch Classes</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Platforms You Use</label>
                  <div className="flex flex-wrap gap-3">
                    {['Zoom', 'Google Meet', 'Microsoft Teams', 'Other'].map(plat => (
                      <label key={plat} className="flex items-center space-x-2 border px-3 py-1.5 rounded-md cursor-pointer bg-gray-50">
                        <input
                          type="checkbox"
                          checked={editData.platforms.includes(plat)}
                          onChange={() => handleCheckboxGroupChange('platforms', plat)}
                        />
                        <span className="text-sm">{plat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Availability (Days & Time Slots)</label>
                    <input
                      type="text"
                      name="availability"
                      value={editData.availability}
                      onChange={handleEditChange}
                      placeholder="e.g., Mon-Fri, 6PM-9PM"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Internet Connectivity</label>
                    <select
                      name="internetConnectivity"
                      value={editData.internetConnectivity}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border rounded-md bg-white"
                    >
                      <option value="High-Speed Broadband">High-Speed Broadband</option>
                      <option value="Mobile Hotspot/Standard">Mobile Hotspot / Standard</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Required Setup</label>
                  <div className="flex flex-wrap gap-3">
                    {['Laptop/Desktop', 'Webcam', 'Digital Writing Pad', 'Headset'].map(setup => (
                      <label key={setup} className="flex items-center space-x-2 border px-3 py-1.5 rounded-md cursor-pointer bg-gray-50">
                        <input
                          type="checkbox"
                          checked={editData.requiredSetup.includes(setup)}
                          onChange={() => handleCheckboxGroupChange('requiredSetup', setup)}
                        />
                        <span className="text-sm">{setup}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. PRICING DETAILS */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-1">4. Pricing Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fees for Individual Classes (Per Hour)</label>
                    <input
                      type="text"
                      name="individualFee"
                      value={editData.individualFee}
                      onChange={handleEditChange}
                      placeholder="₹ "
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fees for Batch Classes (Per Student/Month)</label>
                    <input
                      type="text"
                      name="batchFee"
                      value={editData.batchFee}
                      onChange={handleEditChange}
                      placeholder="₹ "
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Payment Mode</label>
                  <select
                    name="preferredPaymentMode"
                    value={editData.preferredPaymentMode}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>
              </div>

              {/* 5. LOCATION & PREFERENCE */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-1">5. Location & Preference</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Students Preferred Location (if hybrid)</label>
                  <input
                    type="text"
                    name="preferredLocation"
                    value={editData.preferredLocation}
                    onChange={handleEditChange}
                    placeholder="e.g., Specific city or online only"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Languages You Can Teach In</label>
                  <input
                    type="text"
                    name="languages"
                    value={editData.languages}
                    onChange={handleEditChange}
                    placeholder="e.g., English, Hindi, Tamil"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              {/* DOCUMENTS REQUIRED & PROFILE IMAGE */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-1">Documents Required & Images</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditData(prev => ({ ...prev, profileImage: e.target.files[0] }))}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">ID Proof (Aadhar/PAN/Passport)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setEditData(prev => ({ ...prev, idProof: e.target.files[0] }))}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Qualification Certificates</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setEditData(prev => ({ ...prev, qualificationCertificates: e.target.files[0] }))}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Experience Certificates (if applicable)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setEditData(prev => ({ ...prev, experienceCertificates: e.target.files[0] }))}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
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
                  className="px-6 py-2 text-white rounded-md font-medium transition disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
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
