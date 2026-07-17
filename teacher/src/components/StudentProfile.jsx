import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Trash2, Loader2, Edit, Save, X } from "lucide-react";
import { theme } from "../theme";
import { getStudentById, getAllEnrollments, updateStudentData, BACKEND_BASE_URL } from "../services/api";
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

  const thStyle = {
    padding: "16px 20px",
    fontWeight: 600,
    textAlign: "left",
    fontSize: "14px",
    color: theme.colors.textSecondary,
    background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.card} 100%)`,
    borderBottom: `2px solid ${theme.colors.border}`,
  };

  const tdStyle = {
    padding: "18px 20px",
    fontSize: "14px",
    color: theme.colors.textPrimary,
    borderBottom: `1px solid ${theme.colors.border}`,
  };

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
        profileImage: null, // For file upload
      });
    }
  }, [studentData]);

  const fetchStudentData = async () => {
    try {
      const response = await getStudentById(studentId);
      const student = response.data;
      // Construct the full image URL if profileImage exists
      const imageUrl = student.profileImage ? (student.profileImage.startsWith('http') ? student.profileImage : `${BACKEND_BASE_URL}${student.profileImage}`) : null;
      setStudentData({
        ...student,
        image: imageUrl,
      });
    } catch (err) {
      console.error("Failed to fetch student data:", err);
      toast.error("Failed to load student data");
    }
  };

  const fetchStudentEnrollments = async () => {
    try {
      const response = await getAllEnrollments({ studentId });
      setEnrollments(response.data || []);
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
      setEnrollments([]);
    } finally {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedStudentData(prev => ({
        ...prev,
        profileImage: file,
      }));
    }
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
      // Construct the full image URL if profileImage exists
      const imageUrl = updatedStudent.profileImage ? (updatedStudent.profileImage.startsWith('http') ? updatedStudent.profileImage : `${BACKEND_BASE_URL}${updatedStudent.profileImage}`) : null;
      setStudentData({
        ...updatedStudent,
        image: imageUrl,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update student data:", err);
      if (err.response && err.response.status === 400) {
        toast.error(err.response.data.message || "Validation error");
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedStudentData({
      name: studentData.name || '',
      address: studentData.address || '',
      country: studentData.country || '',
      profileImage: null,
    });
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.secondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Loader2 size={48} style={{ color: theme.colors.primary, animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 16, color: theme.colors.textSecondary }}>Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.secondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: theme.colors.textSecondary }}>Student not found</p>
          <button
            onClick={handleBack}
            style={{
              marginTop: 16,
              padding: "8px 16px",
              background: theme.colors.primary,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }



  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.secondary,
          padding: 24,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 600 }}>
            Students{" "}
            <span style={{ color: theme.colors.primary }}>
              / {studentData.name}
            </span>
          </h2>

          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 8,
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.card,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* TOP PROFILE SECTION */}
        <div
          style={{
            background: theme.colors.card,
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: theme.colors.primary,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 24,
                position: "relative",
              }}
            >
              {isEditing && editedStudentData.profileImage ? (
                <img
                  src={URL.createObjectURL(editedStudentData.profileImage)}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                  }}
                />
              ) : studentData.image ? (
                <img
                  src={studentData.image}
                  alt={studentData.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                studentData.name.charAt(0)
              )}
              {isEditing && (
                <label
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    background: theme.colors.primary,
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: `2px solid ${theme.colors.card}`,
                  }}
                >
                  <Edit size={12} color="#fff" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedStudentData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    border: "none",
                    background: "transparent",
                    color: theme.colors.textPrimary,
                    outline: "none",
                    borderBottom: `2px solid ${theme.colors.primary}`,
                    padding: "4px 0",
                  }}
                />
              ) : (
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
                  {studentData.name}
                </h1>
              )}
              <p style={{ fontSize: 16, color: theme.colors.textSecondary, margin: "8px 0 0" }}>
                Student ID: {studentData.studentId}
              </p>
              <p style={{ fontSize: 14, color: theme.colors.textSecondary, margin: "4px 0 0" }}>
                Email: {studentData.email}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    background: theme.colors.success,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: saving ? "not-allowed" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    background: "transparent",
                    color: theme.colors.textSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <X size={16} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  background: theme.colors.primary,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <Edit size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {/* LEFT PANEL - Navigation */}
          <div
            style={{
              width: 320,
              background: theme.colors.card,
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div
              style={{
                marginTop: 24,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <TabButton
                label="Personal Information"
                active={activeTab === "personal"}
                onClick={() => setActiveTab("personal")}
              />
              <TabButton
                label="Courses"
                active={activeTab === "courses"}
                onClick={() => setActiveTab("courses")}
              />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div
            style={{
              flex: 1,
              background: theme.colors.card,
              borderRadius: 16,
              padding: 24,
            }}
          >
            {activeTab === "personal" && (
              <>
                <h3 style={{ marginBottom: 16 }}>Personal Information</h3>

                <EditableInfoRow
                  label="Full Name"
                  value={studentData.name}
                  isEditing={isEditing}
                  editedValue={editedStudentData.name}
                  onChange={(value) => handleInputChange('name', value)}
                />
                <InfoRow label="Email" value={studentData.email} />
                <InfoRow label="Mobile Number" value={studentData.mobile} />
                <EditableInfoRow
                  label="Country"
                  value={studentData.country}
                  isEditing={isEditing}
                  editedValue={editedStudentData.country}
                  onChange={(value) => handleInputChange('country', value)}
                />
                <EditableInfoRow
                  label="Address"
                  value={studentData.address}
                  isEditing={isEditing}
                  editedValue={editedStudentData.address}
                  onChange={(value) => handleInputChange('address', value)}
                />

                <h3 style={{ margin: "24px 0 16px" }}>Parent Information</h3>

                <InfoRow label="Parent Name" value={studentData.parentName} />
                <InfoRow label="Parent Email" value={studentData.parentEmail} />
                <InfoRow
                  label="Parent Mobile"
                  value={studentData.parentMobile}
                />
              </>
            )}

            {activeTab === "courses" && (
  <>
    <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}>
      Enrolled Courses
    </h3>

    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <table width="100%" style={{ borderCollapse: "collapse" }}>
        <thead
          style={{
            background: theme.colors.secondary,
            color: theme.colors.textSecondary,
            fontSize: 14,
          }}
        >
          <tr>
            <th style={thStyle}>S.no</th>
            <th style={thStyle}>Course Name</th>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {enrollments.map((enrollment, index) => (
            <tr
              key={enrollment.id}
              style={{
                borderTop: `1px solid ${theme.colors.border}`,
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${theme.colors.secondary} 0%, rgba(59, 130, 246, 0.1) 100%)`;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <td style={tdStyle}>{index + 1}</td>

              <td style={{ ...tdStyle, fontWeight: 500 }}>{enrollment.courseName}</td>

              <td style={tdStyle}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: `${statusColor[enrollment.status]}20`,
                    color: statusColor[enrollment.status],
                    border: `1px solid ${statusColor[enrollment.status]}30`,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {enrollment.status}
                </span>
              </td>

              <td style={{ ...tdStyle, textAlign: "right" }}>
                <button
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${theme.colors.danger}20`;
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <Trash2 size={16} color={theme.colors.danger} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}

          </div>
        </div>
      </div>

    </>
  );
}

/* ===== Reusable Components ===== */

function TabButton({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 10,
        borderRadius: 8,
        cursor: "pointer",
        background: active ? theme.colors.secondary : "transparent",
        color: active ? theme.colors.primary : theme.colors.textPrimary,
      }}
    >
      {label}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: "10px 0",
      }}
    >
      <span style={{ color: theme.colors.textSecondary }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function EditableInfoRow({ label, value, isEditing, editedValue, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: "10px 0",
      }}
    >
      <span style={{ color: theme.colors.textSecondary }}>{label}</span>
      {isEditing ? (
        <input
          type="text"
          value={editedValue}
          onChange={(e) => onChange(e.target.value)}
          style={{
            fontWeight: 500,
            border: "none",
            background: "transparent",
            color: theme.colors.textPrimary,
            outline: "none",
            borderBottom: `2px solid ${theme.colors.primary}`,
            padding: "4px 0",
            textAlign: "right",
            flex: 1,
            marginLeft: 16,
          }}
        />
      ) : (
        <span style={{ fontWeight: 500 }}>{value}</span>
      )}
    </div>
  );
}
