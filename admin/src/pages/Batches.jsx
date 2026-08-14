import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";
import {
  getAllClasses,
  getAllSubjects,
  getSuperAdminSubjectCourses,
  getSuperAdminCourseParticipants,
} from "../services/api";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Batches() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedBatchCode, setExpandedBatchCode] = useState(null);
  const [participantsMap, setParticipantsMap] = useState({});
  const [participantsLoading, setParticipantsLoading] = useState({});
  const [teacherOpenMap, setTeacherOpenMap] = useState({});
  const [studentOpenMap, setStudentOpenMap] = useState({});

  const classOptions = useMemo(
    () => classes.map((item) => item.className || item.classLevel || item.name).filter(Boolean).sort(),
    [classes]
  );

  const subjectOptions = useMemo(
    () => subjects.filter((subject) => subject.ForClass === selectedClass),
    [subjects, selectedClass]
  );

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await getAllClasses();
        const rows = Array.isArray(response) ? response : response?.data || [];
        setClasses(rows);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]);
      setSelectedSubjectCode("");
      return;
    }

    const fetchSubjects = async () => {
      try {
        const response = await getAllSubjects();
        const rows = Array.isArray(response) ? response : response?.data || [];
        setSubjects(rows);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setSubjects([]);
      }
    };

    fetchSubjects();
    setSelectedSubjectCode("");
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass || !selectedSubjectCode) {
      setBatches([]);
      setExpandedBatchCode(null);
      return;
    }

    const fetchBatches = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getSuperAdminSubjectCourses(selectedSubjectCode);
        const rows = Array.isArray(response) ? response : response?.data || [];
        setBatches(rows);
      } catch (err) {
        console.error("Failed to fetch subject courses:", err);
        setBatches([]);
        setError(err.message || "Unable to load batches for this subject.");
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [selectedClass, selectedSubjectCode]);

  const fetchParticipants = async (courseCode) => {
    if (!courseCode || participantsMap[courseCode]) return;

    try {
      setParticipantsLoading((prev) => ({ ...prev, [courseCode]: true }));
      const response = await getSuperAdminCourseParticipants(courseCode);
      const data = response?.data || response || { teachers: [], students: [] };
      const approvedTeachers = (data.teachers || []).filter((teacher) => 
        String(teacher.status || '').toLowerCase() === 'approved'
      );
      const approvedStudents = (data.students || []).filter((student) => 
        String(student.status || '').toLowerCase() === 'approved'
      );

      setParticipantsMap((prev) => ({
        ...prev,
        [courseCode]: {
          teachers: approvedTeachers,
          students: approvedStudents,
        },
      }));
    } catch (err) {
      console.error("Failed to fetch participants:", err);
      setParticipantsMap((prev) => ({
        ...prev,
        [courseCode]: { teachers: [], students: [] },
      }));
    } finally {
      setParticipantsLoading((prev) => ({ ...prev, [courseCode]: false }));
    }
  };

  const toggleBatch = async (courseCode) => {
    const isOpening = expandedBatchCode !== courseCode;
    setExpandedBatchCode(isOpening ? courseCode : null);

    if (isOpening) {
      await fetchParticipants(courseCode);
    }
  };

  return (
    <div
      className="p-4 sm:p-6"
      style={{ backgroundColor: theme.colors.secondary, minHeight: "100vh" }}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
          Manage Batches
        </h1>
      </div>

      <div
        className="rounded-xl border p-4 shadow-sm"
        style={{
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none"
              style={{
                backgroundColor: "#fff",
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            >
              <option value="">Choose a class</option>
              {classOptions.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
              Select Subject
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              disabled={!selectedClass}
              className="w-full rounded-md border px-3 py-2 outline-none disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: "#fff",
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            >
              <option value="">{selectedClass ? "Choose a subject" : "Select a class first"}</option>
              {subjectOptions.map((subject) => (
                <option key={subject.subjectCode} value={subject.subjectCode}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {selectedClass && selectedSubjectCode && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
              Batches
            </h2>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: theme.colors.primary + "20",
                color: theme.colors.primary,
              }}
            >
              {batches.length} course{batches.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div
              className="rounded-lg border px-6 py-10 text-center text-sm"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.textSecondary,
              }}
            >
              Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div
              className="rounded-lg border px-6 py-10 text-center text-sm"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.textSecondary,
              }}
            >
              No batches found for this subject.
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch) => {
                const isExpanded = expandedBatchCode === batch.courseCode;
                const participants = participantsMap[batch.courseCode] || { teachers: [], students: [] };
                const showTeachers = teacherOpenMap[batch.courseCode] ?? true;
                const showStudents = studentOpenMap[batch.courseCode] ?? true;
                const startDate = batch.courseStartDate || batch.startDate || batch.start_date;
                const endDate = batch.deadline || batch.endDate || batch.end_date;

                return (
                  <div
                    key={batch.courseCode}
                    className="rounded-xl border shadow-sm"
                    style={{
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleBatch(batch.courseCode)}
                      className="w-full px-4 py-4 text-left"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {batch.courseName}
                          </div>
                          <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            {batch.courseCode}
                          </div>
                        </div>

                        <div className="grid gap-2 text-sm sm:grid-cols-2 sm:gap-6">
                          <div>
                            <span style={{ color: theme.colors.textSecondary }}>Start Date: </span>
                            <span style={{ color: theme.colors.textPrimary }}>{formatDate(startDate)}</span>
                          </div>
                          <div>
                            <span style={{ color: theme.colors.textSecondary }}>End Date: </span>
                            <span style={{ color: theme.colors.textPrimary }}>{formatDate(endDate)}</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t px-4 py-4" style={{ borderColor: theme.colors.border }}>
                        {participantsLoading[batch.courseCode] ? (
                          <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            Loading participants...
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="rounded-lg border p-3" style={{ borderColor: theme.colors.border }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTeacherOpenMap((prev) => ({ ...prev, [batch.courseCode]: !showTeachers }));
                                }}
                                className="flex w-full items-center justify-between text-left text-sm font-semibold"
                                style={{ color: theme.colors.textPrimary }}
                              >
                                <span>Teachers</span>
                                <span>{showTeachers ? "▾" : "▸"}</span>
                              </button>

                              {showTeachers && (
                                <div className="mt-3 space-y-2">
                                  {participants.teachers?.length ? (
                                    participants.teachers.map((teacher) => (
                                      <button
                                        type="button"
                                        key={teacher.teacherId || teacher.email || teacher.name}
                                        className="w-full rounded-md bg-gray-50 px-3 py-2 text-left text-sm transition hover:bg-gray-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/teachers/profile/${teacher.teacherId}`);
                                        }}
                                      >
                                        <div className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                          {teacher.name || "Unknown teacher"}
                                        </div>
                                        <div style={{ color: theme.colors.textSecondary }}>{teacher.email || "No email"}</div>
                                        <div style={{ color: theme.colors.textSecondary }}>{teacher.mobile || "No mobile"}</div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                      No teachers assigned.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="rounded-lg border p-3" style={{ borderColor: theme.colors.border }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStudentOpenMap((prev) => ({ ...prev, [batch.courseCode]: !showStudents }));
                                }}
                                className="flex w-full items-center justify-between text-left text-sm font-semibold"
                                style={{ color: theme.colors.textPrimary }}
                              >
                                <span>Students</span>
                                <span>{showStudents ? "▾" : "▸"}</span>
                              </button>

                              {showStudents && (
                                <div className="mt-3 space-y-2">
                                  {participants.students?.length ? (
                                    participants.students.map((student) => (
                                      <button
                                        type="button"
                                        key={student.studentId || student.email || student.name}
                                        className="w-full rounded-md bg-gray-50 px-3 py-2 text-left text-sm transition hover:bg-gray-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/students/profile/${student.studentId}`);
                                        }}
                                      >
                                        <div className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                          {student.name || "Unknown student"}
                                        </div>
                                        <div style={{ color: theme.colors.textSecondary }}>{student.email || "No email"}</div>
                                        <div style={{ color: theme.colors.textSecondary }}>
                                          Progress: {student.progressPercentage ?? 0}%
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                      No students enrolled.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
