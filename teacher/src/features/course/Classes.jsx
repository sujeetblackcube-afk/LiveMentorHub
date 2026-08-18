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

      await createLiveSession(formData);

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

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const data = await getTeacherLiveSessions(user.teacherId, {
          status: activeTab,
          page: currentPage,
          limit: itemsPerPage,
        });
        setSessions(data.data || []);
        setFilteredSessions(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
      } catch (error) {
        toast.error("Failed to fetch sessions");
      } finally {
        setLoading(false);
      }
    };

    if (user?.teacherId) fetchSessions();
  }, [user, activeTab, currentPage]);

  useEffect(() => {
    if (activeTab === "completed") {
      const filtered = sessions.filter(
        (s) =>
          s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSessions(filtered);
    } else {
      setFilteredSessions(sessions);
    }
  }, [searchTerm, sessions, activeTab]);

  const refreshSessions = async () => {
    const data = await getTeacherLiveSessions(user.teacherId, {
      status: activeTab,
    });
    setSessions(data.data || []);
    setFilteredSessions(data.data || []);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    return `${formatDate(isoString)}, ${formatTime(isoString)}`;
  };

  return (
    <div
      className="h-screen flex flex-col relative"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* ================= HEADER (FIXED) ================= */}
      <div
        className="sticky top-0 z-40 border-b"
        style={{
          background: theme.gradients.secondary,
          borderColor: theme.colors.border,
        }}
      >
        <div className="p-5">
          <div className="flex justify-center items-center relative">
            <h1
              className="text-3xl font-bold text-center"
              style={{
                background: theme.gradients.primary,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Classes
            </h1>
          </div>

          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm("");
                }}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300"
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
                key={session.id}
                className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{
                  background: theme.gradients.card,
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 8px 20px ${theme.colors.shadow}`,
                }}
              >
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

                {(activeTab === "upcoming" ||
                  activeTab === "ongoing") && (
                  <div className="flex gap-2">
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
                            .catch((error) => {
                              toast.error("Failed to delete session");
                            });
                        }
                      }}
                      className="flex-1 py-2 rounded-lg text-white text-sm"
                      style={{ background: theme.colors.danger || '#dc2626' }}
                    >
                      Delete
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const stream =
                            await navigator.mediaDevices.getUserMedia({
                              video: true,
                              audio: true,
                            });
                          stream
                            .getTracks()
                            .forEach((track) => track.stop());

                          const response =
                            await startLiveSession(
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
                          toast.error(
                            "Failed to start live session"
                          );
                        }
                      }}
                      className="flex-1 py-2 rounded-lg text-white text-sm"
                      style={{ background: theme.colors.success }}
                    >
                      {activeTab === "ongoing"
                        ? "Join"
                        : "Go Live"}
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
        className="fixed bottom-15 right-15 z-50 px-6 py-3.5 rounded-full font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
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
          handleSubmitSession={handleSubmitSession}
          allowCourseSelection={true}
          courses={availableCourses}
        />
      )}

      {editingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Session</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                
                if (new Date(editForm.startTime) < new Date()) {
                  toast.error("Start time cannot be in the past");
                  return;
                }
                if (new Date(editForm.endTime) <= new Date(editForm.startTime)) {
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
                  await updateLiveSession(editingSession.sessionId, formData);
                  toast.success("Session updated successfully");
                  setEditingSession(null);
                  refreshSessions();
                } catch (error) {
                  toast.error("Failed to update session");
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  value={editForm.startTime}
                  onChange={(e) =>
                    setEditForm({ ...editForm, startTime: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  min={editForm.startTime || new Date().toISOString().slice(0, 16)}
                  value={editForm.endTime}
                  onChange={(e) =>
                    setEditForm({ ...editForm, endTime: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isPrivate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isPrivate: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Private
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update
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
