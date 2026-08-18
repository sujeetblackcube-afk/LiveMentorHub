import "./student.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Trash2, Loader2, Edit, Save, X } from "lucide-react";
import { theme } from "../../theme";
import { getStudentById, getAllEnrollments, updateStudentData, BACKEND_BASE_URL } from "../../services/api";
import { toast } from "react-toastify";

export default function StudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("courses");
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudentData, setEditedStudentData] = useState({});
  const [saving, setSaving] = useState(false);

  const statusColor = {
    APPROVED: theme.colors.success,
    PENDING: "#F59E0B",
    REJECTED: theme.colors.danger,
  };

  useEffect(() => {
    fetchStudentData();
    fetchStudentEnrollments();
  }, [studentId]);

  useEffect(() => {
    if (studentData) {
      setEditedStudentData({
        name: studentData.name || '',
        address: studentData.address || '',
        country: studentData.country || '',
        profileImage: null,
      });
    }
  }, [studentData]);

  const fetchStudentData = async () => {
    try {
      const response = await getStudentById(studentId);
      const student = response.data;
      const imageUrl = student.profileImage ? (student.profileImage.startsWith('http') ? student.profileImage : `${BACKEND_BASE_URL}${student.profileImage}`) : null;
      setStudentData({
        ...student,
        image: imageUrl,
      });
    } catch (err) {}
  };

  const fetchStudentEnrollments = async () => {
    try {
      const response = await getAllEnrollments({ studentId });
      setEnrollments(response.data || []);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditedStudentData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        name: editedStudentData.name,
        address: editedStudentData.address,
        country: editedStudentData.country,
      };

      if (editedStudentData.profileImage) {
        updateData.profileImage = editedStudentData.profileImage;
      }

      const response = await updateStudentData(studentId, updateData);
      const updatedStudent = response.data;
      const imageUrl = updatedStudent.profileImage ? (updatedStudent.profileImage.startsWith('http') ? updatedStudent.profileImage : `${BACKEND_BASE_URL}${updatedStudent.profileImage}`) : null;
      setStudentData({
        ...updatedStudent,
        image: imageUrl,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-slate-500">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500">Student not found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-page-container">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Student Profile</h1>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
            <button
              onClick={handleEditToggle}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Edit size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Profile Summary Card */}
        <div className="student-profile-card">
          <div className="text-center mb-6">
            <img
              src={studentData.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"}
              alt={studentData.name}
              className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-50 shadow-sm"
            />
            <h2 className="text-xl font-bold text-slate-800">{studentData.name}</h2>
            <p className="text-sm text-slate-500">{studentData.email}</p>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-semibold text-slate-700">{studentData.studentId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Mobile:</span>
              <span className="font-semibold text-slate-700">{studentData.mobile}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Country:</span>
              <span className="font-semibold text-slate-700">{studentData.country || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Right Details Container */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 font-medium rounded-lg text-sm transition-colors ${
                activeTab === "courses" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Enrolled Courses
            </button>
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-4 py-2 font-medium rounded-lg text-sm transition-colors ${
                activeTab === "personal" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Personal Details
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                <EditableInfoRow
                  label="Full Name"
                  value={studentData.name}
                  isEditing={isEditing}
                  editedValue={editedStudentData.name}
                  onChange={(value) => handleInputChange("name", value)}
                />
                <InfoRow label="Email" value={studentData.email} />
                <InfoRow label="Mobile Number" value={studentData.mobile} />
                <EditableInfoRow
                  label="Country"
                  value={studentData.country}
                  isEditing={isEditing}
                  editedValue={editedStudentData.country}
                  onChange={(value) => handleInputChange("country", value)}
                />
                <EditableInfoRow
                  label="Address"
                  value={studentData.address}
                  isEditing={isEditing}
                  editedValue={editedStudentData.address}
                  onChange={(value) => handleInputChange("address", value)}
                />

                <h3 className="text-lg font-semibold text-slate-800 pt-4 mb-4">Parent Information</h3>
                <InfoRow label="Parent Name" value={studentData.parentName} />
                <InfoRow label="Parent Email" value={studentData.parentEmail} />
                <InfoRow label="Parent Mobile" value={studentData.parentMobile} />
              </div>
            )}

            {activeTab === "courses" && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Enrolled Courses</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="student-th">S.no</th>
                        <th className="student-th">Course Name</th>
                        <th className="student-th">Status</th>
                        <th className="student-th text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment, index) => (
                        <tr key={enrollment.id} className="student-table-row">
                          <td className="student-td">{index + 1}</td>
                          <td className="student-td font-medium">{enrollment.courseName}</td>
                          <td className="student-td">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              enrollment.status === "APPROVED" ? "bg-green-100 text-green-700" : enrollment.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                            }`}>
                              {enrollment.status}
                            </span>
                          </td>
                          <td className="student-td text-right">
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-transform hover:scale-110">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Reusable Info Components ===== */

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-medium text-slate-700 text-sm">{value || "N/A"}</span>
    </div>
  );
}

function EditableInfoRow({ label, value, isEditing, editedValue, onChange }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
      <span className="text-slate-500 text-sm">{label}</span>
      {isEditing ? (
        <input
          type="text"
          value={editedValue || ""}
          onChange={(e) => onChange(e.target.value)}
          className="border-b-2 border-indigo-600 bg-transparent text-slate-800 text-right text-sm outline-none px-1 font-medium"
        />
      ) : (
        <span className="font-medium text-slate-700 text-sm">{value || "N/A"}</span>
      )}
    </div>
  );
}