import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { theme } from "../theme";
import {
  addNotes,
  getNotes,
  deleteNote,
  createAssignment,
  getAssignments,
  deleteAssignment,
  createBulkLiveSessions,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, DEFAULT_BANNER_IMAGE } from "../utils/image";

const CourseDetail = () => {
  const { courseCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const course = location.state?.course;

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploadType, setUploadType] = useState(null); 
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    file: null,
  });
  const [activeTab, setActiveTab] = useState("notes");

  // Assignment state
  const [assignments, setAssignments] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    dueDate: "",
    totalMarks: "",
    file: null,
  });
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [mainTab, setMainTab] = useState("content"); // 'content' or 'assignment'

  // Schedule Class Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionData, setSessionData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    maxParticipants: 100,
    isPrivate: false,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar-based Schedule State
  const [selectedDates, setSelectedDates] = useState([]); // Array of selected date strings (YYYY-MM-DD)
  const [selectedMonths, setSelectedMonths] = useState([]); // Array of selected month strings (YYYY-MM)
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false); // Toggle calendar visibility

  useEffect(() => {
    if (course) {
      fetchNotes();
      fetchAssignments();
    }
  }, [course]);

  const fetchAssignments = async () => {
    try {
      // Get teacherId from auth context
      const teacherId = user?.teacherId;
      if (!teacherId) {
        toast.error("Teacher ID not found");
        return;
      }
      const response = await getAssignments(teacherId, courseCode);
      setAssignments(response.assignments || []);
    } catch (error) {
      toast.error("Failed to fetch assignments");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (
      !assignmentData.title ||
      !assignmentData.description ||
      !assignmentData.dueDate ||
      !assignmentData.totalMarks
    ) {
      toast.error("All fields are required");
      return;
    }

    setCreatingAssignment(true);
    try {
      // Get teacherId from auth context
      const teacherId = user?.teacherId;
      if (!teacherId) {
        toast.error("Teacher ID not found");
        setCreatingAssignment(false);
        return;
      }
      
      await createAssignment(
        teacherId,
        courseCode,
        {
          title: assignmentData.title,
          description: assignmentData.description,
          dueDate: assignmentData.dueDate,
          totalMarks: assignmentData.totalMarks,
        },
        assignmentData.file,
      );

      toast.success("Assignment created successfully");
      setShowAssignmentModal(false);
      setAssignmentData({
        title: "",
        description: "",
        dueDate: "",
        totalMarks: "",
        file: null,
      });
      fetchAssignments();
    } catch (error) {
      toast.error("Failed to create assignment");
    } finally {
      setCreatingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteAssignment(id);
        toast.success("Assignment deleted successfully");
        fetchAssignments();
      } catch (error) {
        toast.error("Failed to delete assignment");
      }
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await getNotes({
        courseCode,
        teacherId: user.teacherId,
      });
      setNotes(response.notes || []);
    } catch (error) {
      toast.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.title) {
      toast.error("Title and file are required");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("courseCode", courseCode);
      formData.append("courseType", course.courseType || "academic"); // assuming default
      formData.append("teacherId", user.teacherId);
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description);
      formData.append(
        "contentType",
        uploadType === "notes"
          ? "NOTES"
          : uploadType === "video"
            ? "RECORDED_VIDEO"
            : "IMAGE",
      );
      formData.append("file", uploadData.file);

      await addNotes(formData);
      toast.success("Uploaded successfully");
      setShowModal(false);
      setUploadType(null);
      setUploadData({ title: "", description: "", file: null });
      fetchNotes(); // refresh
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteNote(id);
        toast.success("Deleted successfully");
        fetchNotes();
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  // Handle Schedule Class
  const handleScheduleClass = (courseItem) => {
    // Reset all form fields when opening the modal
    setSessionData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      maxParticipants: 100,
      isPrivate: false,
    });
    setSelectedDates([]);
    setSelectedMonths([]);
    setShowCalendar(false);
    setThumbnail(null);
    setShowScheduleModal(true);
  };

  // Handle Submit Session - Calendar-based (Bulk API)
  const handleSubmitSession = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const teacherId = user.teacherId;

      // Validate required fields
      if (!sessionData.title || !sessionData.startTime || !sessionData.endTime) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Validate that start time is not in the past
      if (new Date(sessionData.startTime) < new Date()) {
        toast.error('Start time cannot be in the past');
        setIsSubmitting(false);
        return;
      }

      // Validate that end time is after start time
      if (sessionData.startTime && sessionData.endTime) {
        const startDate = new Date(sessionData.startTime);
        const endDate = new Date(sessionData.endTime);
        
        if (endDate <= startDate) {
          toast.error('End time must be after start time');
          setIsSubmitting(false);
          return;
        }
      }

      // Validate that dates are selected
      if (selectedDates.length === 0 && selectedMonths.length === 0) {
        toast.error('Please select at least one date or month');
        setIsSubmitting(false);
        return;
      }

      // Get the time portion from startTime and endTime to apply to selected dates
      const startTimeDate = new Date(sessionData.startTime);
      const endTimeDate = new Date(sessionData.endTime);
      const startTimeHours = startTimeDate.getHours();
      const startTimeMinutes = startTimeDate.getMinutes();
      const endTimeHours = endTimeDate.getHours();
      const endTimeMinutes = endTimeDate.getMinutes();

      // Generate list of all selected dates
      const allSelectedDates = [];

      // Add individual dates
      selectedDates.forEach(dateStr => {
        allSelectedDates.push(dateStr);
      });

      // Add dates from selected months
      selectedMonths.forEach(monthStr => {
        const [year, month] = monthStr.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          allSelectedDates.push(dateStr);
        }
      });

      // Sort dates
      allSelectedDates.sort();

      // console.log('Selected dates for scheduling:', allSelectedDates);

      // Create sessions array for bulk API - preserving local timezone
      const sessions = allSelectedDates.map(dateStr => {
        // Parse the date and apply the time using local timezone
        const [year, month, day] = dateStr.split('-').map(Number);

        // Create date in local timezone and format as ISO string without timezone conversion
        const localStartDate = new Date(year, month - 1, day, startTimeHours, startTimeMinutes, 0);
        const localEndDate = new Date(year, month - 1, day, endTimeHours, endTimeMinutes, 0);

        // Format as ISO string preserving local timezone
        const formatLocalISO = (date) => {
          const pad = (n) => String(n).padStart(2, '0');
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        return {
          title: sessionData.title,
          description: sessionData.description,
          startTime: formatLocalISO(localStartDate),
          endTime: formatLocalISO(localEndDate),
        };
      });

      // Prepare bulk data for API
      const bulkData = new FormData();
      bulkData.append('sessions', JSON.stringify(sessions));
      bulkData.append('courseCode', courseCode);
      bulkData.append('teacherId', teacherId);
      bulkData.append('maxParticipants', sessionData.maxParticipants);
      bulkData.append('isPrivate', sessionData.isPrivate);

      if (thumbnail) {
        bulkData.append('thumbnail', thumbnail);
      }

      // Single bulk API call instead of for loop
      const result = await createBulkLiveSessions(bulkData);

      toast.success(`${result.count || sessions.length} live session(s) scheduled successfully!`);

      setShowScheduleModal(false);
      setShowCalendar(false);
      setSessionData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        maxParticipants: 100,
        isPrivate: false,
      });
      setThumbnail(null);
      setSelectedDates([]);
      setSelectedMonths([]);
    } catch (error) {
      console.error('Error scheduling live session:', error);
      toast.error('Failed to schedule live session');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Course Info - Enhanced with Gradient Banner */}
        <div 
          className="rounded-2xl p-6 mb-6 shadow-lg"
          style={{ 
            background: theme.gradients.primary,
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={getImageUrl(course.thumbnail || course.image || course.banner)}
              alt={course.courseName || course.title || "Course"}
              className="w-24 h-24 object-cover rounded-xl shadow-md"
              onError={(e) => {
                e.target.src = DEFAULT_BANNER_IMAGE;
              }}
            />
            <div className="flex-1">
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: '#FFFFFF' }}
              >
                {course.courseName}
              </h1>
              <p
                className="text-lg mb-4"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {course.courseCode}
              </p>

              {/* Info Badges */}
              <div className="flex flex-wrap gap-3">
                {/* Enrollment Badge */}
                <div className="flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="mr-1.5">👥</span>
                  <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    {course.totalenrollment || 0} Enrolled
                  </span>
                </div>
                
                {/* Rating Badge */}
                <div className="flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="mr-1.5">⭐</span>
                  <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    {course.rating ? course.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>

                {/* Course Type Badge */}
                <div className="flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="mr-1.5">📖</span>
                  <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    {course.courseType ? course.courseType.charAt(0).toUpperCase() + course.courseType.slice(1) : 'N/A'}
                  </span>
                </div>

                {/* Deadline Badge */}
                <div className="flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="mr-1.5">📅</span>
                  <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    {course.deadline ? `Due: ${new Date(course.deadline).toLocaleDateString()}` : 'No deadline'}
                  </span>
                </div>

                {/* Duration Badge */}
                <div className="flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="mr-1.5">⏱️</span>
                  <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    {course.courseDuration ? `${course.courseDuration} days` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleScheduleClass(course);
              }}
              className="px-6 py-3 text-white rounded-xl hover:opacity-90 transition-all transform hover:scale-105 shadow-lg font-medium"
              style={{ 
                backgroundColor: '#FFFFFF',
                color: theme.colors.primary,
              }}
            >
              📅 Schedule Class
            </button>
          </div>
        </div>

        {/* Main Tabs */}
        <div
          className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg"
          style={{ backgroundColor: theme.colors.secondary }}
        >
          <button
            onClick={() => setMainTab("content")}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              mainTab === "content"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            style={{
              backgroundColor:
                mainTab === "content" ? theme.colors.background : "transparent",
              color:
                mainTab === "content"
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
            }}
          >
            📁 Uploaded Items
          </button>
          <button
            onClick={() => setMainTab("assignment")}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              mainTab === "assignment"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            style={{
              backgroundColor:
                mainTab === "assignment"
                  ? theme.colors.background
                  : "transparent",
              color:
                mainTab === "assignment"
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
            }}
          >
            📝 Assignment
          </button>
        </div>

        {/* Content Tab */}
        {mainTab === "content" && (
          <div
            className="bg-white rounded-lg shadow-lg p-6"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: theme.colors.textPrimary }}
            >
              Uploaded Items
            </h2>

            {/* Tabs */}
            <div
              className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg"
              style={{ backgroundColor: theme.colors.secondary }}
            >
              <button
                onClick={() => {
                  setActiveTab("notes");
                  setUploadType("notes");
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "notes"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{
                  backgroundColor:
                    activeTab === "notes"
                      ? theme.colors.background
                      : "transparent",
                  color:
                    activeTab === "notes"
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary,
                }}
              >
                📄 Notes
              </button>
              <button
                onClick={() => {
                  setActiveTab("videos");
                  setUploadType("video");
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "videos"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{
                  backgroundColor:
                    activeTab === "videos"
                      ? theme.colors.background
                      : "transparent",
                  color:
                    activeTab === "videos"
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary,
                }}
              >
                🎥 Videos
              </button>
              <button
                onClick={() => {
                  setActiveTab("images");
                  setUploadType("img");
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "images"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{
                  backgroundColor:
                    activeTab === "images"
                      ? theme.colors.background
                      : "transparent",
                  color:
                    activeTab === "images"
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary,
                }}
              >
                🖼️ Images
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2"
                  style={{ borderColor: theme.colors.primary }}
                ></div>
              </div>
            ) : (
              (() => {
                const filteredNotes = notes.filter((item) => {
                  if (activeTab === "all") return true;
                  if (activeTab === "notes")
                    return item.contentType === "NOTES";
                  if (activeTab === "videos")
                    return item.contentType === "RECORDED_VIDEO";
                  if (activeTab === "images")
                    return item.contentType === "IMAGE";
                  return true;
                });

                return (
                  <div>
                    {filteredNotes.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📭</div>
                        <p
                          className="text-lg mb-6"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          No {activeTab} items uploaded yet.
                        </p>
                        <button
                          onClick={() => {
                            setUploadType(
                              activeTab === "notes"
                                ? "notes"
                                : activeTab === "videos"
                                  ? "video"
                                  : "img",
                            );
                            setShowModal(true);
                          }}
                          className="px-6 py-3 text-white rounded-lg hover:opacity-80 transition-colors font-medium"
                          style={{ backgroundColor: theme.colors.primary }}
                        >
                          Add{" "}
                          {activeTab === "notes"
                            ? "Notes"
                            : activeTab === "videos"
                              ? "Video"
                              : "Image"}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4 flex justify-end">
                          <button
                            onClick={() => {
                              setUploadType(
                                activeTab === "notes"
                                  ? "notes"
                                  : activeTab === "videos"
                                    ? "video"
                                    : "img",
                              );
                              setShowModal(true);
                            }}
                            className="px-4 py-2 text-white rounded hover:opacity-80 transition-colors flex items-center space-x-2"
                            style={{ backgroundColor: theme.colors.primary }}
                          >
                            <span>+</span>
                            <span>
                              Add{" "}
                              {activeTab === "notes"
                                ? "Notes"
                                : activeTab === "videos"
                                  ? "Video"
                                  : "Image"}
                            </span>
                          </button>
                        </div>
                        <div 
                          className="overflow-hidden rounded-lg border"
                          style={{ borderColor: theme.colors.border }}
                        >
                          <div 
                            className="overflow-y-auto"
                            style={{ maxHeight: '400px' }}
                          >
                            <table
                              className="w-full table-auto border-collapse"
                              style={{ backgroundColor: theme.colors.background }}
                            >
                              <thead 
                                className="sticky top-0 z-10"
                                style={{ 
                                  backgroundColor: theme.colors.secondary,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                              >
                                <tr>
                                  <th
                                    className="px-4 py-3 text-left text-sm font-semibold"
                                    style={{ color: theme.colors.textPrimary }}
                                  >
                                    Title
                                  </th>
                                  <th
                                    className="px-4 py-3 text-left text-sm font-semibold"
                                    style={{ color: theme.colors.textPrimary }}
                                  >
                                    Type
                                  </th>
                                  <th
                                    className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell"
                                    style={{ color: theme.colors.textPrimary }}
                                  >
                                    Description
                                  </th>
                                  <th
                                    className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell"
                                    style={{ color: theme.colors.textPrimary }}
                                  >
                                    Date
                                  </th>
                                  <th
                                    className="px-4 py-3 text-left text-sm font-semibold"
                                    style={{ color: theme.colors.textPrimary }}
                                  >
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredNotes.map((item, index) => (
                                  <tr
                                    key={item.id}
                                    className="border-b transition-colors hover:bg-gray-50"
                                    style={{ 
                                      borderColor: theme.colors.border,
                                    }}
                                  >
                                    <td
                                      className="px-4 py-3 text-sm font-medium"
                                      style={{ color: theme.colors.textPrimary }}
                                    >
                                      {item.title}
                                    </td>
                                    <td
                                      className="px-4 py-3 text-sm capitalize"
                                      style={{
                                        color: theme.colors.textSecondary,
                                      }}
                                    >
                                      <span 
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style={{
                                          backgroundColor: item.contentType === 'RECORDED_VIDEO' ? '#DBEAFE' : item.contentType === 'IMAGE' ? '#D1FAE5' : '#FEF3C7',
                                          color: item.contentType === 'RECORDED_VIDEO' ? '#1E40AF' : item.contentType === 'IMAGE' ? '#065F46' : '#92400E'
                                        }}
                                      >
                                        {item.contentType === "RECORDED_VIDEO"
                                          ? "📹 Video"
                                          : item.contentType === "IMAGE"
                                            ? "🖼️ Image"
                                            : "📄 Notes"}
                                      </span>
                                    </td>
                                    <td
                                      className="px-4 py-3 text-sm hidden sm:table-cell"
                                      style={{
                                        color: theme.colors.textSecondary,
                                      }}
                                    >
                                      {item.description}
                                    </td>
                                    <td
                                      className="px-4 py-3 text-sm hidden sm:table-cell"
                                      style={{
                                        color: theme.colors.textSecondary,
                                      }}
                                    >
                                      {new Date(
                                        item.createdAt || Date.now(),
                                      ).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-3 py-1.5 text-white text-xs rounded-lg hover:opacity-80 transition-all transform hover:scale-105"
                                        style={{
                                          backgroundColor: theme.colors.danger,
                                        }}
                                      >
                                        🗑️ Delete
                                      </button>
                                      {item.contentType === "NOTES" && (
                                        <>
                                          <a
                                            href={item.contentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 px-3 py-1.5 text-white text-xs rounded-lg hover:opacity-80 transition-all transform hover:scale-105 inline-block"
                                            style={{
                                              backgroundColor: theme.colors.primary,
                                            }}
                                          >
                                            👁️ View
                                          </a>
                                          <a
                                            href={item.contentUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 px-3 py-1.5 text-white text-xs rounded-lg hover:opacity-80 transition-all transform hover:scale-105 inline-block bg-gray-600"
                                          >
                                            ⬇️ Download
                                          </a>
                                        </>
                                      )}
                                      {item.contentType === "IMAGE" && (
                                        <>
                                          <a
                                            href={item.contentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 px-3 py-1.5 text-white text-xs rounded-lg hover:opacity-80 transition-all transform hover:scale-105 inline-block"
                                            style={{
                                              backgroundColor: theme.colors.success,
                                            }}
                                          >
                                            👁️ View
                                          </a>
                                          <a
                                            href={item.contentUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 px-3 py-1.5 text-white text-xs rounded-lg hover:opacity-80 transition-all transform hover:scale-105 inline-block bg-gray-600"
                                          >
                                            ⬇️ Download
                                          </a>
                                        </>
                                      )}
                                      {item.contentType === "RECORDED_VIDEO" && (
                                        <>
                                          <a
                                            href={item.contentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 px-3 py-1.5 text-white text-xs rounded-lg hover:opacity-80 transition-all transform hover:scale-105 inline-block"
                                            style={{
                                              backgroundColor: theme.colors.info,
                                            }}
                                          >
                                            ▶️ Watch
                                          </a>
                                          <a
                                            href={item.contentUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 px-3 py-1.5 text-white text-xs rounded-lg hover:opacity-80 transition-all transform hover:scale-105 inline-block bg-gray-600"
                                          >
                                            ⬇️ Download
                                          </a>
                                        </>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* Assignment Tab */}
        {mainTab === "assignment" && (
          <div
            className="bg-white rounded-lg shadow-lg p-6"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-2xl font-bold"
                style={{ color: theme.colors.textPrimary }}
              >
                Assignments
              </h2>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="px-4 py-2 text-white rounded hover:opacity-80 transition-colors flex items-center space-x-2"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <span>+</span>
                <span>Add Assignment</span>
              </button>
            </div>

            {assignmentLoading ? (
              <div className="flex justify-center items-center py-12">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2"
                  style={{ borderColor: theme.colors.primary }}
                ></div>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p
                  className="text-lg mb-6"
                  style={{ color: theme.colors.textSecondary }}
                >
                  No assignments created yet.
                </p>
                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-80 transition-colors font-medium"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  Create Assignment
                </button>
              </div>
            ) : (
              <div 
                className="overflow-hidden rounded-lg border"
                style={{ borderColor: theme.colors.border }}
              >
                <div 
                  className="overflow-y-auto"
                  style={{ maxHeight: '400px' }}
                >
                  <table
                    className="w-full table-auto border-collapse"
                    style={{ backgroundColor: theme.colors.background }}
                  >
                    <thead 
                      className="sticky top-0 z-10"
                      style={{ 
                        backgroundColor: theme.colors.secondary,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <tr>
                        <th
                          className="px-4 py-3 text-left text-sm font-semibold"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          Title
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          Description
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          Due Date
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          Marks
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-semibold"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => (
                        <tr
                          key={assignment.id}
                          className="border-b transition-colors hover:bg-gray-50"
                          style={{ borderColor: theme.colors.border }}
                        >
                          <td
                            className="px-4 py-3 text-sm font-medium"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            {assignment.title}
                          </td>
                          <td
                            className="px-4 py-3 text-sm hidden sm:table-cell"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            {assignment.description}
                          </td>
                          <td
                            className="px-4 py-3 text-sm hidden sm:table-cell"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </td>
                          <td
                            className="px-4 py-3 text-sm hidden sm:table-cell"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: '#EDE9FE',
                                color: '#5B21B6'
                              }}
                            >
                              {assignment.totalMarks} marks
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() =>
                                handleDeleteAssignment(assignment.id)
                              }
                              className="px-3 py-1.5 text-white text-xs rounded-lg hover:opacity-80 transition-all transform hover:scale-105"
                              style={{
                                backgroundColor: theme.colors.danger,
                              }}
                            >
                              🗑️ Delete
                            </button>
                            {assignment.fileUrl && (
                              <a
                                href={assignment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 px-3 py-1.5 text-white text-xs rounded-lg hover:opacity-80 transition-all transform hover:scale-105 inline-block"
                                style={{
                                  backgroundColor: theme.colors.primary,
                                }}
                              >
                                👁️ View
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* MODAL */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Schedule Live Session</h2>
              <form onSubmit={handleSubmitSession}>
                {/* Date Selection Button */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Dates</label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    📅 {showCalendar ? 'Hide Calendar' : 'Click to Select Dates (Individual days or whole months)'}
                  </button>
                </div>

                {/* Calendar Section - Only show when toggled */}
                {showCalendar && (
                  <div className="mb-4 border rounded-lg p-4 bg-gray-50 relative">
                    {/* Close button */}
                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>

                    <div className="flex gap-4 mb-2">
                      <button
                        type="button"
                        onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        ← Prev
                      </button>
                      <span className="font-medium flex-1 text-center">
                        {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        Next →
                      </button>
                    </div>

                    {/* Month Header - Click to select entire month */}
                    <div
                      className={`p-2 text-center cursor-pointer rounded mb-2 font-medium ${selectedMonths.includes(`${currentCalendarDate.getFullYear()}-${String(currentCalendarDate.getMonth() + 1).padStart(2, '0')}`) ? 'bg-blue-500 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'}`}
                      onClick={() => {
                        const monthKey = `${currentCalendarDate.getFullYear()}-${String(currentCalendarDate.getMonth() + 1).padStart(2, '0')}`;
                        if (selectedMonths.includes(monthKey)) {
                          setSelectedMonths(selectedMonths.filter(m => m !== monthKey));
                        } else {
                          setSelectedMonths([...selectedMonths, monthKey]);
                        }
                      }}
                    >
                      🗓️ Click to select {currentCalendarDate.toLocaleString('default', { month: 'long' })} (Whole Month)
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="font-medium p-2 bg-gray-200 rounded">{day}</div>
                      ))}
                      {(() => {
                        const year = currentCalendarDate.getFullYear();
                        const month = currentCalendarDate.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const cells = [];
                        // Empty cells for days before first day of month
                        for (let i = 0; i < firstDay; i++) {
                          cells.push(<div key={`empty-${i}`} className="p-2"></div>);
                        }

                        // Day cells
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(year, month, day);
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
                          const isPast = date < today;
                          const isSelected = selectedDates.includes(dateStr);
                          const isMonthSelected = selectedMonths.includes(monthKey);

                          cells.push(
                            <div
                              key={day}
                              className={`p-2 cursor-pointer rounded font-medium transition-colors ${
                                isMonthSelected
                                  ? 'bg-blue-300 text-blue-800 border-2 border-blue-400'
                                  : isSelected
                                    ? 'bg-blue-500 text-white border-2 border-blue-600'
                                    : isPast
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'hover:bg-blue-100 hover:border-blue-300 border-2 border-transparent'
                              }`}
                              onClick={() => {
                                if (!isPast && !isMonthSelected) {
                                  if (isSelected) {
                                    setSelectedDates(selectedDates.filter(d => d !== dateStr));
                                  } else {
                                    setSelectedDates([...selectedDates, dateStr]);
                                  }
                                }
                              }}
                            >
                              {day}
                            </div>
                          );
                        }
                        return cells;
                      })()}
                    </div>
                  </div>
                )}

                {/* Selected Summary */}
                {(selectedDates.length > 0 || selectedMonths.length > 0) && (
                  <div className="mb-4 p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium">Selected:</p>
                    {selectedDates.length > 0 && (
                      <p className="text-xs text-gray-600">{selectedDates.length} individual date(s)</p>
                    )}
                    {selectedMonths.length > 0 && (
                      <p className="text-xs text-gray-600">{selectedMonths.length} month(s): {selectedMonths.join(', ')}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => { setSelectedDates([]); setSelectedMonths([]); }}
                      className="text-xs text-red-500 hover:underline mt-1"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={sessionData.title}
                    onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={sessionData.description}
                    onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Thumbnail</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    className="w-full p-2 border rounded"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    value={sessionData.startTime}
                    onChange={(e) => setSessionData({ ...sessionData, startTime: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    min={sessionData.startTime || new Date().toISOString().slice(0, 16)}
                    value={sessionData.endTime}
                    onChange={(e) => setSessionData({ ...sessionData, endTime: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {/* Max Participants input commented out as requested */}
                {/* 
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={sessionData.maxParticipants || 100}
                    onChange={(e) => setSessionData({ ...sessionData, maxParticipants: parseInt(e.target.value) || 100 })}
                    className="w-full p-2 border rounded"
                    min="1"
                    disabled={isSubmitting}
                  />
                </div>
                */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sessionData.isPrivate}
                      onChange={(e) => setSessionData({ ...sessionData, isPrivate: e.target.checked })}
                      className="mr-2"
                      disabled={isSubmitting}
                    />
                    Private Session
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setShowCalendar(false);
                      setSelectedDates([]);
                      setSelectedMonths([]);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
                    disabled={isSubmitting || (selectedDates.length === 0 && selectedMonths.length === 0)}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scheduling...
                      </>
                    ) : (
                      'Schedule'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4"
            style={{ backgroundColor: theme.colors.card }}
          >
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: theme.colors.textPrimary }}
            >
              Add{" "}
              {uploadType === "notes"
                ? "Notes"
                : uploadType === "video"
                  ? "Video"
                  : "Image"}
            </h3>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                    "--tw-ring-color": theme.colors.primary,
                  }}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      description: e.target.value.slice(0, 100),
                    })
                  }
                  maxLength={100}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                  }}
                  rows="4"
                />

                <p
                  className="text-sm mt-1"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {uploadData.description.length} / 100 characters
                </p>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Upload Content
                </label>
                <input
                  type="file"
                  accept={
                    uploadType === "notes"
                      ? ".pdf,.doc,.docx,.txt"
                      : uploadType === "video"
                        ? ".mp4,.avi,.mov"
                        : ".jpg,.jpeg,.png,.gif"
                  }
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file: e.target.files[0] })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                  }}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setUploadType(null);
                    setUploadData({ title: "", description: "", file: null });
                  }}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-colors"
                  style={{ backgroundColor: theme.colors.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4"
            style={{ backgroundColor: theme.colors.card }}
          >
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: theme.colors.textPrimary }}
            >
              Create Assignment
            </h3>
            <form onSubmit={handleCreateAssignment}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={assignmentData.title}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                    "--tw-ring-color": theme.colors.primary,
                  }}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Description
                </label>
                <textarea
                  value={assignmentData.description}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      description: e.target.value.slice(0, 500),
                    })
                  }
                  maxLength={500}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                  }}
                  rows="4"
                  required
                />
                <p
                  className="text-sm mt-1"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {assignmentData.description.length} / 500 characters
                </p>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Due Date
                </label>
                <input
                  type="date"
                  value={assignmentData.dueDate}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                    "--tw-ring-color": theme.colors.primary,
                  }}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Total Marks
                </label>
                <input
                  type="number"
                  value={assignmentData.totalMarks}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      totalMarks: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                    "--tw-ring-color": theme.colors.primary,
                  }}
                  min="1"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      file: e.target.files[0],
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setAssignmentData({
                      title: "",
                      description: "",
                      dueDate: "",
                      totalMarks: "",
                      file: null,
                    });
                  }}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-colors"
                  style={{ backgroundColor: theme.colors.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAssignment}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {creatingAssignment ? "Creating..." : "Create Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
