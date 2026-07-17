import React, { useState, useEffect } from "react";
import { Check, Users, UserCheck, GraduationCap, User } from "lucide-react";
import { toast } from "react-toastify";
import { theme } from "../theme.js";
import { getStudents, getTeachers, getParents, getAllEnrollments, sendBroadcast } from "../services/api.js";

export default function ManageBroadcast() {
  const [activeTab, setActiveTab] = useState("all");
  const [userTypeTab, setUserTypeTab] = useState("students");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedParents, setSelectedParents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedEnrolledStudents, setSelectedEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (activeTab === "select") {
      fetchUsers();
    }
  }, [activeTab, userTypeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (userTypeTab === "students") {
        const response = await getStudents({ status: "APPROVED" });
        setStudents((response.data || []).map(student => ({ ...student, id: student.studentId })));
      } else if (userTypeTab === "teachers") {
        const response = await getTeachers({ status: "APPROVED" });
        setTeachers((response.data || []).map(teacher => ({ ...teacher, id: teacher.teacherId })));
      } else if (userTypeTab === "parents") {
        const response = await getParents({ status: "APPROVED" });
        setParents((response.data || []).map(parent => ({ ...parent, id: parent.parentId })));
      } else if (userTypeTab === "enrolledStudents") {
        const response = await getAllEnrollments({ status: "APPROVED" });
        const enrollments = response.data || [];
        const uniqueStudentsMap = new Map();
        enrollments.forEach(enrollment => {
          if (!uniqueStudentsMap.has(enrollment.studentId)) {
            uniqueStudentsMap.set(enrollment.studentId, {
              id: enrollment.studentId,
              studentId: enrollment.studentId,
              name: enrollment.studentName,
              email: enrollment.studentEmail,
              mobile: enrollment.studentMobile,
              courseName: enrollment.courseName,
              courseCode: enrollment.courseCode
            });
          }
        });
        setEnrolledStudents(Array.from(uniqueStudentsMap.values()));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId, userType) => {
    if (userType === "students") {
      setSelectedStudents((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId],
      );
    } else if (userType === "teachers") {
      setSelectedTeachers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId],
      );
    } else if (userType === "parents") {
      setSelectedParents((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId],
      );
    } else if (userType === "enrolledStudents") {
      setSelectedEnrolledStudents((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId],
      );
    }
  };

  const handleSelectAll = (userType) => {
    if (userType === "students") {
      setSelectedStudents(
        selectedStudents.length === students.length
          ? []
          : students.map((student) => student.id),
      );
    } else if (userType === "teachers") {
      setSelectedTeachers(
        selectedTeachers.length === teachers.length
          ? []
          : teachers.map((teacher) => teacher.id),
      );
    } else if (userType === "parents") {
      setSelectedParents(
        selectedParents.length === parents.length
          ? []
          : parents.map((parent) => parent.id),
      );
    } else if (userType === "enrolledStudents") {
      setSelectedEnrolledStudents(
        selectedEnrolledStudents.length === enrolledStudents.length
          ? []
          : enrolledStudents.map((student) => student.id),
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    let userType = "";
    let selectedStudentIds = [];
    let selectedTeacherIds = [];
    let selectedParentIds = [];

    if (activeTab === "all") {
      userType = "all";
    } else if (activeTab === "select") {
      const totalSelected =
        selectedStudents.length +
        selectedTeachers.length +
        selectedParents.length +
        selectedEnrolledStudents.length;
      if (totalSelected === 0) {
        toast.error("Please select at least one user to send the broadcast");
        return;
      }

      userType = "selected";
      selectedStudentIds = [...selectedStudents, ...selectedEnrolledStudents];
      selectedTeacherIds = [...selectedTeachers];
      selectedParentIds = [...selectedParents];
    }

    setSending(true);
    try {
      const response = await sendBroadcast({
        title,
        message,
        userType,
        selectedStudentIds,
        selectedTeacherIds,
        selectedParentIds
      });

      if (response.success) {
        toast.success(`Broadcast sent successfully to ${response.recipientCount} recipients!`);
      } else {
        toast.error(response.message || "Failed to send broadcast");
      }

      setTitle("");
      setMessage("");
      setSelectedStudents([]);
      setSelectedTeachers([]);
      setSelectedParents([]);
      setSelectedEnrolledStudents([]);
    } catch (error) {
      console.error("Failed to send broadcast:", error);
      toast.error("Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  const getCurrentUsers = () => {
    switch (userTypeTab) {
      case "students":
        return { data: students, selected: selectedStudents, type: "students" };
      case "teachers":
        return { data: teachers, selected: selectedTeachers, type: "teachers" };
      case "parents":
        return { data: parents, selected: selectedParents, type: "parents" };
      case "enrolledStudents":
        return { data: enrolledStudents, selected: selectedEnrolledStudents, type: "enrolledStudents" };
      default:
        return { data: [], selected: [], type: "" };
    }
  };

  const {
    data: currentUsers,
    selected: currentSelected,
    type: currentType,
  } = getCurrentUsers();

  const getDisplayLabel = () => {
    switch (userTypeTab) {
      case "enrolledStudents": return "Enrolled Students";
      default: return userTypeTab.charAt(0).toUpperCase() + userTypeTab.slice(1);
    }
  };

  return (
    <div
      className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8"
      style={{ backgroundColor: theme.colors.secondary }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h1
          className="text-lg sm:text-xl md:text-2xl font-semibold"
          style={{ color: theme.colors.textPrimary }}
        >
          Manage Broadcast
        </h1>
        <span className="text-xs sm:text-sm" style={{ color: theme.colors.textSecondary }}>
          Dashboard / Manage Broadcast
        </span>
      </div>

      <div
        className="rounded-xl p-4 sm:p-6 shadow-sm"
        style={{ backgroundColor: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
      >
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
              activeTab === "all"
                ? "text-white shadow"
                : "border hover:opacity-80"
            }`}
            style={{
              backgroundColor:
                activeTab === "all" ? theme.colors.primary : "transparent",
              borderColor: theme.colors.primary,
              color: activeTab === "all" ? "white" : theme.colors.primary,
            }}
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            All Users
          </button>

          <button
            onClick={() => setActiveTab("select")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
              activeTab === "select"
                ? "text-white shadow"
                : "border hover:opacity-80"
            }`}
            style={{
              backgroundColor:
                activeTab === "select" ? theme.colors.primary : "transparent",
              borderColor: theme.colors.primary,
              color: activeTab === "select" ? "white" : theme.colors.primary,
            }}
          >
            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Select Users
          </button>
        </div>

        {activeTab === "select" && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 ml-0 sm:ml-4">
            <button
              onClick={() => setUserTypeTab("students")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-2 ${
                userTypeTab === "students"
                  ? "text-white shadow"
                  : "border hover:opacity-80"
              }`}
              style={{
                backgroundColor:
                  userTypeTab === "students"
                    ? theme.colors.primary
                    : "transparent",
                borderColor: theme.colors.primary,
                color:
                  userTypeTab === "students" ? "white" : theme.colors.primary,
              }}
            >
              <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
              Students ({selectedStudents.length})
            </button>

            <button
              onClick={() => setUserTypeTab("enrolledStudents")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-2 ${
                userTypeTab === "enrolledStudents"
                  ? "text-white shadow"
                  : "border hover:opacity-80"
              }`}
              style={{
                backgroundColor:
                  userTypeTab === "enrolledStudents"
                    ? theme.colors.primary
                    : "transparent",
                borderColor: theme.colors.primary,
                color:
                  userTypeTab === "enrolledStudents" ? "white" : theme.colors.primary,
              }}
            >
              <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
              Enrolled Students ({selectedEnrolledStudents.length})
            </button>

            <button
              onClick={() => setUserTypeTab("teachers")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-2 ${
                userTypeTab === "teachers"
                  ? "text-white shadow"
                  : "border hover:opacity-80"
              }`}
              style={{
                backgroundColor:
                  userTypeTab === "teachers"
                    ? theme.colors.primary
                    : "transparent",
                borderColor: theme.colors.primary,
                color:
                  userTypeTab === "teachers" ? "white" : theme.colors.primary,
              }}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              Teachers ({selectedTeachers.length})
            </button>

            <button
              onClick={() => setUserTypeTab("parents")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-2 ${
                userTypeTab === "parents"
                  ? "text-white shadow"
                  : "border hover:opacity-80"
              }`}
              style={{
                backgroundColor:
                  userTypeTab === "parents"
                    ? theme.colors.primary
                    : "transparent",
                borderColor: theme.colors.primary,
                color:
                  userTypeTab === "parents" ? "white" : theme.colors.primary,
              }}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              Parents ({selectedParents.length})
            </button>
          </div>
        )}

        {activeTab === "select" && (
          <div
            className="mb-4 sm:mb-6 p-2 sm:p-4 border rounded-lg"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.secondary,
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <h3
                className="text-base sm:text-lg font-medium"
                style={{ color: theme.colors.textPrimary }}
              >
                Select {getDisplayLabel()}
              </h3>
              <button
                onClick={() => handleSelectAll(currentType)}
                className="px-3 py-1 text-xs sm:text-sm rounded border hover:opacity-80 transition"
                style={{
                  borderColor: theme.colors.primary,
                  color: theme.colors.primary,
                }}
              >
                {currentSelected.length === currentUsers.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div
                  className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 mx-auto"
                  style={{ borderColor: theme.colors.primary }}
                ></div>
                <p
                  className="text-xs sm:text-sm mt-2"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Loading {getDisplayLabel()}...
                </p>
              </div>
            ) : (
              <div
                className="rounded-lg border overflow-hidden"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
              >
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead style={{ backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }} className="border-b">
                      <tr className="whitespace-nowrap">
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3" style={{ color: theme.colors.textSecondary }}>S.no</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3" style={{ color: theme.colors.textSecondary }}>Name</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 hidden sm:table-cell" style={{ color: theme.colors.textSecondary }}>ID</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 hidden md:table-cell" style={{ color: theme.colors.textSecondary }}>Email</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 hidden lg:table-cell" style={{ color: theme.colors.textSecondary }}>Mobile</th>
                        {userTypeTab === "enrolledStudents" && (
                          <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3" style={{ color: theme.colors.textSecondary }}>Course</th>
                        )}
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3" style={{ color: theme.colors.textSecondary }}>Select</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className="border-t hover:opacity-80 whitespace-nowrap"
                          style={{ borderColor: theme.colors.border }}
                        >
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">{index + 1}</td>
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: theme.colors.primary }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <span
                                className="font-medium text-xs sm:text-sm"
                                style={{ color: theme.colors.textPrimary }}
                              >
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td
                            className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 font-medium hidden sm:table-cell"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            {user.studentId || user.teacherId || user.parentId}
                          </td>
                          <td
                            className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 hidden md:table-cell"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            {user.email}
                          </td>
                          <td
                            className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 hidden lg:table-cell"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            {user.mobile || "N/A"}
                          </td>
                          {userTypeTab === "enrolledStudents" && (
                            <td
                              className="px-2 sm:px-4 md:px-6 py-2 sm:py-4"
                              style={{ color: theme.colors.textSecondary }}
                            >
                              {user.courseName || "-"}
                            </td>
                          )}
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                            <input
                              type="checkbox"
                              checked={currentSelected.includes(user.id)}
                              onChange={() =>
                                handleUserSelection(user.id, currentType)
                              }
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              style={{ accentColor: theme.colors.primary }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div
              className="mt-4 text-xs sm:text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Selected: {currentSelected.length} {getDisplayLabel()}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.textPrimary }}
            >
              Title *
            </label>
            <input
              type="text"
              placeholder="Enter broadcast title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.textPrimary }}
            >
              Message *
            </label>
            <textarea
              rows="4"
              placeholder="Enter broadcast message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
              required
            />
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 text-white text-sm font-semibold px-32 py-2 rounded-md shadow transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  SEND BROADCAST
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
