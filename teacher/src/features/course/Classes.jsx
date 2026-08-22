import "./course.css";
import React, { useState, useEffect } from "react";
import {
  getTeacherLiveSessions,
  updateLiveSession,
  startLiveSession,
  deleteLiveSession,
  createLiveSession,
  getTeacherCourses,
  BACKEND_BASE_URL,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { theme } from "../../theme";
import LiveVideo from "./LiveVideo";
import { getImageUrl, DEFAULT_BANNER_IMAGE } from "../../utils/image";
import Pagination from "../../components/Pagination";
import ClassCreationModal from "./ClassCreationModal";
import { FileUploadZone } from "../../components/FileUploadZone";

const Classes = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [liveSession, setLiveSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSession, setEditingSession] = useState(null);
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const [editForm, setEditForm] = useState({
    courseCode: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    maxParticipants: "",
    isPrivate: false,
  });

  const tabs = [
    { id: "upcoming", label: "Upcoming Classes" },
    { id: "ongoing", label: "Ongoing Classes" },
    { id: "completed", label: "Completed Classes" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const [sessionData, setSessionData] = useState({
    courseCode: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    maxParticipants: 100,
    isPrivate: false,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitSession = async (e) => {
    e.preventDefault();
    
    if (sessionData.startTime) {
      if (new Date(sessionData.startTime) < new Date()) {
        toast.error("Start time cannot be in the past");
        return;
      }
    }
    
    if (sessionData.startTime && sessionData.endTime) {
      if (new Date(sessionData.endTime) <= new Date(sessionData.startTime)) {
        toast.error("End time must be after start time");
        return;
      }
    }

    if (!sessionData.courseCode) {
      toast.error("Please select a course");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("courseCode", sessionData.courseCode);
      formData.append("teacherId", user.teacherId);
      formData.append("title", sessionData.title);
      formData.append("description", sessionData.description);
      formData.append("startTime", sessionData.startTime);
      formData.append("endTime", sessionData.endTime);
      formData.append("maxParticipants", sessionData.maxParticipants || 100);
      formData.append("isPrivate", sessionData.isPrivate);
      
      if (thumbnail) {
        formData.append("thumbnail", thumbnail); 
      }

      const res = await createLiveSession(formData);
      if (res && res.success === false) {
        throw new Error(res.message || "Failed to create live session");
      }

      toast.success("Session created successfully");
      setIsScheduleModalOpen(false);
      
      setSessionData({
        courseCode: "",
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        maxParticipants: 100,
        isPrivate: false,
      });
      setThumbnail(null);
      
      refreshSessions();
    } catch (error) {
      toast.error("Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch teacher's allocated courses for the dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getTeacherCourses(user.teacherId);
        setAvailableCourses(response.data || response || []);
      } catch (error) {
      }
    };
    if (user?.teacherId) {
      fetchCourses();
    }
  }, [user]);

  // Format date helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Fetch live sessions
  const refreshSessions = async () => {
    if (!user || !user.teacherId) return;
    setLoading(true);

    try {
      const data = await getTeacherLiveSessions(user.teacherId);
      const rawList = data?.data || data?.sessions || (Array.isArray(data) ? data : []);
      const sessionList = Array.isArray(rawList) ? rawList : (rawList?.data || []);

      // Filter based on active tab
      const currentTabSessions = sessionList.filter((session) => {
        return session.status === activeTab;
      });

      setSessions(currentTabSessions);
    } catch {
      toast.error("Failed to load live sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSessions();
  }, [user, activeTab]);

  // Filter based on search term
  useEffect(() => {
    let result = sessions;

    if (searchTerm.trim() !== "") {
      result = result.filter(
        (session) =>
          session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSessions(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage) || 1);
  }, [sessions, searchTerm]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
      }}
    >
      {/* ================= STICKY HEADER SECTION ================= */}
      <div
        className="sticky top-0 z-10 px-6 py-6 transition-all duration-300"
        style={{
          backgroundColor: theme.colors.background,
          borderBottom: `1px solid ${theme.colors.border}`,
          boxShadow: `0 4px 12px ${theme.colors.shadow}`,
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1
            className="text-4xl font-extrabold tracking-tight mb-6"
            style={{
              background: theme.gradients.primary,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Classes
          </h1>

          {/* TABS */}
          <div className="flex justify-center gap-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm("");
                }}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
                style={{
                  background:
                    activeTab === tab.id
                      ? theme.gradients.primary
                      : theme.colors.card,
                  color:
                    activeTab === tab.id
                      ? "#fff"
                      : theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow:
                    activeTab === tab.id
                      ? `0 6px 18px ${theme.colors.shadow}`
                      : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "completed" && (
            <div className="mt-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search by title or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg outline-none"
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.card,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= SCROLLABLE CARD SECTION ================= */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p style={{ color: theme.colors.primary }}>
              Loading classes...
            </p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p style={{ color: theme.colors.textSecondary }}>
              No {activeTab} classes found.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id || session.sessionId}
                className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col justify-between"
                style={{
                  background: theme.gradients.card,
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 8px 20px ${theme.colors.shadow}`,
                }}
              >
                <div>
                  <img
                    src={getImageUrl(session.thumbnailUrl || session.thumbnail || session.image)}
                    alt={session.title || "Class"}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                    onError={(e) => {
                      e.target.src = DEFAULT_BANNER_IMAGE;
                    }}
                  />

                  <h2
                    className="text-lg font-semibold mb-2"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {session.title}
                  </h2>

                  <p
                    className="text-sm mb-3 line-clamp-2"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {session.description}
                  </p>

                  <div className="text-xs space-y-1 mb-3">
                    <p style={{ color: theme.colors.primary }}>
                      {session.courseName}
                    </p>
                    <p style={{ color: theme.colors.textSecondary }}>
                      {formatDateTime(session.startTime)}
                    </p>
                    <p style={{ color: theme.colors.textSecondary }}>
                      End: {formatDateTime(session.endTime)}
                    </p>
                  </div>
                </div>

                {(activeTab === "upcoming" || activeTab === "ongoing") && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingSession(session);
                        setEditThumbnail(null);
                        setEditForm({
                          courseCode: session.courseCode || "",
                          title: session.title || "",
                          description: session.description || "",
                          startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : "",
                          endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : "",
                          maxParticipants: session.maxParticipants || 100,
                          isPrivate: Boolean(session.isPrivate),
                        });
                      }}
                      className="px-3 py-2 rounded-lg text-white text-xs font-semibold bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${session.title}"?`)) {
                          deleteLiveSession(session.sessionId, user.teacherId)
                            .then((result) => {
                              if (result.success) {
                                toast.success("Session deleted successfully");
                                refreshSessions();
                              } else {
                                toast.error(result.message || "Failed to delete session");
                              }
                            })
                            .catch(() => {
                              toast.error("Failed to delete session");
                            });
                        }
                      }}
                      className="px-3 py-2 rounded-lg text-white text-xs font-semibold cursor-pointer"
                      style={{ background: theme.colors.danger || '#dc2626' }}
                    >
                      Delete
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const stream = await navigator.mediaDevices.getUserMedia({
                            video: true,
                            audio: true,
                          });
                          stream.getTracks().forEach((track) => track.stop());

                          const response = await startLiveSession(
                            session.sessionId,
                            user.teacherId
                          );

                          setLiveSession({
                            ...session,
                            appId: response.appId,
                            channelName: response.channelName,
                            token: response.token,
                            uid: response.uid,
                          });
                        } catch {
                          toast.error("Failed to start live session");
                        }
                      }}
                      className="flex-1 py-2 rounded-lg text-white text-xs font-semibold cursor-pointer"
                      style={{ background: theme.colors.success }}
                    >
                      {activeTab === "ongoing" ? "Join" : "Go Live"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <button
        onClick={() => setIsScheduleModalOpen(true)}
        className="fixed bottom-15 right-15 z-40 px-6 py-3.5 rounded-full font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 cursor-pointer"
        style={{ 
          background: theme.gradients.primary || '#3b82f6',
          boxShadow: `0 10px 25px ${theme.colors.shadow || 'rgba(0,0,0,0.3)'}`
        }}
      >
        <span className="text-xl leading-none">+</span> Schedule Class
      </button>

      {liveSession && (
        <LiveVideo
          session={liveSession}
          onClose={() => {
            setLiveSession(null);
            refreshSessions();
          }}
        />
      )}

      {isScheduleModalOpen && (
        <ClassCreationModal
          isActive={isScheduleModalOpen} 
          onClose={() => setIsScheduleModalOpen(false)} 
          sessionData={sessionData} 
          setSessionData={setSessionData} 
          setThumbnail={setThumbnail} 
          isSubmitting={isSubmitting} 
          onSubmit={handleSubmitSession}
          allowCourseSelection={true}
          courses={availableCourses}
        />
      )}

      {editingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Session</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                
                if (editForm.startTime && new Date(editForm.startTime) < new Date()) {
                  toast.error("Start time cannot be in the past");
                  return;
                }
                if (editForm.startTime && editForm.endTime && new Date(editForm.endTime) <= new Date(editForm.startTime)) {
                  toast.error("End time must be after start time");
                  return;
                }

                try {
                  const formData = new FormData();
                  Object.keys(editForm).forEach((key) => {
                    if (editForm[key] !== undefined && editForm[key] !== "") {
                      formData.append(key, editForm[key]);
                    }
                  });
                  if (editThumbnail) {
                    formData.append("thumbnail", editThumbnail);
                  }
                  const res = await updateLiveSession(editingSession.sessionId, formData);
                  if (res && res.success !== false) {
                    toast.success("Session updated successfully");
                    setEditingSession(null);
                    setEditThumbnail(null);
                    refreshSessions();
                  } else {
                    toast.error(res?.message || "Failed to update session");
                  }
                } catch (error) {
                  toast.error("Failed to update session");
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                />
              </div>

              <div className="mb-4">
                <FileUploadZone
                  label="Change Thumbnail Image"
                  accept="image/*"
                  onFileSelect={(f) => setEditThumbnail(f)}
                  currentUrl={editingSession.thumbnailUrl}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Start Time *</label>
                <input
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  value={editForm.startTime}
                  onChange={(e) =>
                    setEditForm({ ...editForm, startTime: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">End Time *</label>
                <input
                  type="datetime-local"
                  min={editForm.startTime || new Date().toISOString().slice(0, 16)}
                  value={editForm.endTime}
                  onChange={(e) =>
                    setEditForm({ ...editForm, endTime: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={editForm.isPrivate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isPrivate: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Private Session
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSession(null);
                    setEditThumbnail(null);
                  }}
                  className="px-4 py-2 border rounded text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
                >
                  Update Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
