import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Save, X, Loader2 } from "lucide-react";
import { theme } from "../theme";
import {
  getTeacherById,
  getSubscriptionsByTeacherId,
  BACKEND_BASE_URL,
} from "../services/api";

import { toast } from "react-toastify";

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
      <span style={{ fontWeight: 500 }}>{value || "-"}</span>
    </div>
  );
}

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
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );
}

function normalizeCourses(coursename) {
  if (!coursename) return [];
  if (Array.isArray(coursename)) return coursename;
  if (typeof coursename === "string") return [coursename];
  return [];
}

export default function TeacherProfile() {
  const { teacherId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [activeTab, setActiveTab] = useState("courses");

  const [isEditing, setIsEditing] = useState(false);
  const [editedTeacherData, setEditedTeacherData] = useState({});

  useEffect(() => {
    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const res = await getTeacherById(teacherId);
        const data = res?.data || res?.teacher || res?.result || res;
        // In reports, teacher details come as { teacher: {...}, ... }
        // In list pages, teacher object seems to have fields directly.
        const teacher = data?.teacher ? data.teacher : data;

        const imageUrl = teacher?.profileImage
          ? teacher.profileImage.startsWith("http")
            ? teacher.profileImage
            : `${BACKEND_BASE_URL}${teacher.profileImage}`
          : null;

        setTeacherData({
          ...teacher,
          image: imageUrl,
        });
      } catch (e) {
        console.error("Failed to fetch teacher profile:", e);
        toast.error("Failed to load teacher profile");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  useEffect(() => {
    if (!teacherData) return;
    setEditedTeacherData({
      name: teacherData.name || "",
      address: teacherData.address || "",
      country: teacherData.country || "",
    });
  }, [teacherData]);

  const handleBack = () => navigate(-1);

  const courses = normalizeCourses(teacherData?.coursename);

  // Subscriptions (buyed) by this teacher
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  useEffect(() => {
    if (!teacherData?.teacherId) return;

    const fetchSubscriptions = async () => {
      setSubscriptionsLoading(true);
      try {
        const res = await getSubscriptionsByTeacherId(teacherData.teacherId);
        setSubscriptions(res?.data || []);
      } catch (e) {
        console.error("Failed to fetch teacher subscriptions:", e);
        setSubscriptions([]);
      } finally {
        setSubscriptionsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [teacherData?.teacherId]);

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return "-";
    }
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
          <Loader2
            size={48}
            style={{ color: theme.colors.primary, animation: "spin 1s linear infinite" }}
          />
          <p style={{ marginTop: 16, color: theme.colors.textSecondary }}>
            Loading teacher profile...
          </p>
        </div>
      </div>
    );
  }

  if (!teacherData) {
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
          <p style={{ color: theme.colors.textSecondary }}>Teacher not found</p>
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

  const initials = teacherData.name
    ? teacherData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "T";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.colors.secondary,
        padding: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>
          Teachers <span style={{ color: theme.colors.primary }}>/ {teacherData.name}</span>
        </h2>

        <button
          onClick={handleBack}
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
              overflow: "hidden",
            }}
          >
            {teacherData.image ? (
              <img
                src={teacherData.image}
                alt={teacherData.name}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>

          <div>
            {isEditing ? (
              <input
                type="text"
                value={editedTeacherData.name}
                onChange={(e) => setEditedTeacherData((p) => ({ ...p, name: e.target.value }))}
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
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{teacherData.name}</h1>
            )}
            <p style={{ fontSize: 16, color: theme.colors.textSecondary, margin: "8px 0 0" }}>
              Teacher ID: {teacherData.teacherId}
            </p>
            <p style={{ fontSize: 14, color: theme.colors.textSecondary, margin: "4px 0 0" }}>
              Email: {teacherData.email}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {/* Edit UI only; saving teacher fields is not implemented since current task is profile+courses */}
          {isEditing ? (
            <>
              <button
                disabled
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  background: theme.colors.success,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "not-allowed",
                  fontWeight: 600,
                  opacity: 0.7,
                }}
                title="Teacher update not implemented"
              >
                <Save size={16} /> Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
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
                <X size={16} /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
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
              <Edit size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* LEFT PANEL */}
        <div
          style={{
            width: 320,
            background: theme.colors.card,
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
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
            <TabButton
              label="Subscriptions"
              active={activeTab === "subscriptions"}
              onClick={() => setActiveTab("subscriptions")}
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
              <InfoRow label="Full Name" value={teacherData.name} />
              <InfoRow label="Email" value={teacherData.email} />
              <InfoRow label="Mobile Number" value={teacherData.mobile} />
              <InfoRow label="Country" value={teacherData.country} />
              <InfoRow label="Address" value={teacherData.address} />
            </>
          )}

          {activeTab === "courses" && (
            <>
              <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}>
                Teacher's Courses
              </h3>

              <div
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                {courses.length === 0 ? (
                  <p style={{ color: theme.colors.textSecondary }}>No courses assigned.</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {courses.map((c, idx) => (
                      <span
                        key={`${c}-${idx}`}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 999,
                          background: `${theme.colors.primary}14`,
                          color: theme.colors.primary,
                          fontWeight: 600,
                          fontSize: 13,
                          border: `1px solid ${theme.colors.primary}30`,
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "subscriptions" && (
            <>
              <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}>
                Subscriptions Bought
              </h3>

              <div
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                {subscriptionsLoading ? (
                  <p style={{ color: theme.colors.textSecondary }}>Loading...</p>
                ) : subscriptions.length === 0 ? (
                  <p style={{ color: theme.colors.textSecondary }}>No subscriptions bought by this teacher.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>Plan</th>
                          <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>Status</th>
                          <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>Payment</th>
                          <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>Amount</th>
                          <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>Start</th>
                          <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>End</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((s) => (
                          <tr key={s.id || s.orderId || Math.random()}>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>{s.planName || "-"}</td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>
                              {s.status || "-"}
                              {s.studentName ? (
                                <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                                  Student: {s.studentName}
                                </div>
                              ) : null}
                            </td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>{s.paymentStatus || "-"}</td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>{s.price ? `₹${Number(s.price).toLocaleString()}` : "-"}</td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>{formatDate(s.startDate)}</td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${theme.colors.border}` }}>{formatDate(s.endDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

