"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  Eye,
  File,   
  MessageSquare,
  Star,
  X,
  Download,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/store/useAuth";
import { API_BASE, ASSIGNMENT_PATHS } from "@/lib/api";
import { UnauthenticatedPlacard } from "@/components/dashboard/UnauthenticatedPlacard";
import { motion, AnimatePresence } from "framer-motion";

type AssignmentStatus = "notsubmitted" | "submitted" | "checked";

interface Assignment {
  id: string;
  assignmentId: string;
  studentId: string;
  courseCode?: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  submittedDate?: string | null;
  status: AssignmentStatus;
  progress?: number;
  totalQuestions?: number;
  completedQuestions?: number;
  grade?: string;
  fileUrl?: string | null;
  fileType?: string | null;
  // Additional fields from API
  submissionText?: string | null;
  submissionFileUrl?: string | null;
  submissionFileType?: string | null;
  obtainedMarks?: number | null;
  totalMarks?: number | null;
  feedback?: string | null;
  teacherName?: string | null;
}

export default function AssignmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AssignmentStatus>("notsubmitted");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const studentId =
    user?.studentId ||
    (typeof window !== "undefined" && localStorage.getItem("studentId")) ||
    "";
  const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : "";

  useEffect(() => {
    if (studentId && token) fetchAssignments();
  }, [studentId, token]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_BASE}${ASSIGNMENT_PATHS.getAssignmentsByStudent(studentId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const assignmentsArray = Array.isArray(res.data.assignments)
        ? res.data.assignments
        : [];

      const mapped: Assignment[] = assignmentsArray.map((a: any) => ({
        ...a,
        status:
          a.status === "checked"
            ? "checked"
            : a.status === "submitted"
            ? "submitted"
            : "notsubmitted",
        submittedDate: a.submittedAt,
        progress:
          a.totalMarks && a.obtainedMarks
            ? Math.floor((a.obtainedMarks / a.totalMarks) * 100)
            : undefined,
      }));

      setAssignments(mapped);
    } catch (err: any) {
      console.error("Failed to fetch assignments:", err);
      setError(err.response?.data?.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };


  const openSubmitDialog = (assignment: Assignment) => {
    setSubmittingAssignment(assignment);
    setSubmissionText("");
    setSelectedFile(null);
    setIsSubmitDialogOpen(true);
  };

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!submittingAssignment || !token) return;

    const duePassed = isDueExpired(submittingAssignment.dueDate);
    
    if (duePassed) {
      alert("Due date passed! You cannot submit this assignment.");
      return;
    }

    if (!selectedFile && !submissionText.trim()) {
      alert("Please select a file or enter submission text.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("assignmentId", submittingAssignment.assignmentId);
      formData.append("studentId", studentId);
      formData.append("submissionText", submissionText);
      
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await axios.post(
        `${API_BASE}${ASSIGNMENT_PATHS.submitAssignment}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Assignment submitted successfully!");
      
      // Close dialog and refresh
      setIsSubmitDialogOpen(false);
      setSubmittingAssignment(null);
      fetchAssignments();
      
    } catch (err: any) {
      console.error("Submission failed:", err);
      alert(err.response?.data?.message || "Failed to submit assignment. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleViewSubmission = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsDialogOpen(true);
  };

  const getFileName = (url: string | null | undefined) => {
    if (!url) return "Submitted File";
    const parts = url.split("/");
    return parts[parts.length - 1] || "Submitted File";
  };

  const isDueExpired = (dueDate?: string | null) => {
    // Treat dueDate as the whole day to avoid timezone issues
    // (e.g. dueDate stored as 2026-05-19 00:00 UTC should still be valid for 19th in IST)

    if (!dueDate) return false;
    const d = new Date(dueDate);
    if (Number.isNaN(d.getTime())) return false;
    d.setHours(23, 59, 59, 999);
    return new Date() > d;
  };

  const filteredAssignments = assignments.filter(a => a.status === activeTab);
  const stats = {
    notsubmitted: assignments.filter(a => a.status === "notsubmitted").length,
    submitted: assignments.filter(a => a.status === "submitted").length,
    checked: assignments.filter(a => a.status === "checked").length,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-16"
    >

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0d1f5c] tracking-tight">Assignments</h1>
          <p className="text-gray-600 font-medium mt-1.5 text-[15px]">Track and submit your course assignments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {(["notsubmitted", "submitted", "checked"] as AssignmentStatus[]).map(status => {
          const isActive = activeTab === status;
          const config = {
            notsubmitted: { label: "Pending", color: "text-orange-600", bg: "bg-orange-50", icon: Clock },
            submitted: { label: "Submitted", color: "text-blue-600", bg: "bg-blue-50", icon: Upload },
            checked: { label: "Checked", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 }
          }[status];

          return (
            <Card
              key={status}
              className={`cursor-pointer transition-all duration-500 rounded-2xl border-gray-100 overflow-hidden relative group ${
                isActive ? "shadow-xl ring-2 ring-[#d4940a] -translate-y-1" : "hover:shadow-lg hover:border-gray-200"
              }`}
              onClick={() => setActiveTab(status)}
            >
              {isActive && (
                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#d4940a]" />
              )}
              <CardContent className="p-7 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{config.label}</p>
                  <p className={`text-4xl font-black ${isActive ? 'text-[#0d1f5c]' : 'text-gray-400'} mt-2 transition-colors`}>{stats[status]}</p>
                </div>
                <div className={`h-14 w-14 rounded-2xl ${isActive ? config.bg : 'bg-gray-50'} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                  <config.icon className={`h-7 w-7 ${isActive ? config.color : 'text-gray-300'}`} strokeWidth={2.5} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[#0d1f5c] capitalize">{activeTab.replace('not', 'not ')} Assignments</h2>
          <div className="h-px flex-1 bg-gray-100 mx-6 opacity-50" />
        </div>

        {!isAuthenticated ? (
          <UnauthenticatedPlacard icon={FileText} sectionName="assignments" />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="h-10 w-10 border-4 border-[#d4940a]/20 border-t-[#d4940a] rounded-full animate-spin" />
             <p className="text-gray-500 font-bold text-sm">Fetching your portal...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="border-dashed border-2 border-gray-100 bg-gray-50/30">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-[#0d1f5c] mb-2">
                  All Caught Up!
                </h3>
                <p className="text-sm text-gray-500 max-w-xs font-medium">
                  {activeTab === 'notsubmitted' 
                    ? "Great job! You have no pending assignments to submit right now."
                    : `You haven't ${activeTab} any assignments yet.`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredAssignments.map((assignment, index) => {
                const duePassed = isDueExpired(assignment.dueDate);
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    key={assignment.id}
                  >
                    <Card className="h-full bg-white rounded-2xl border border-gray-100 p-1 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden active:scale-95">
                      {/* Interactive Glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_40px_rgba(13,31,92,0.1)_inset]" />
                      
                      <CardHeader className="pb-4 pt-6 px-6 flex flex-col gap-2 relative z-10">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <Badge className="bg-[#0d1f5c]/5 text-[#0d1f5c] border-0 px-3 py-1 font-bold">
                            {assignment.courseCode || "Course"}
                          </Badge>
                          
                          {assignment.status === "notsubmitted" && assignment.dueDate && (
                            <Badge className={duePassed ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}>
                              <Clock className="h-3 w-3 mr-1" />
                              {duePassed ? "Expired" : assignment.dueDate}
                            </Badge>
                          )}
                          {assignment.status === "submitted" && (
                            <Badge className="bg-blue-50 text-blue-600">
                              <Upload className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {assignment.status === "checked" && (
                            <Badge className="bg-emerald-50 text-emerald-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Graded
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-[#0d1f5c] text-[17px] leading-tight group-hover:text-[#d4940a] transition-all duration-300">
                          {assignment.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                          {assignment.description}
                        </p>
                      </CardHeader>

                      <CardContent className="pb-6 px-6 space-y-4 relative z-10">
                        <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-xl text-sm font-bold text-[#0d1f5c]">
                          <CalendarDays className="h-4 w-4 text-[#d4940a]" />
                          <span className="opacity-80">
                            {assignment.status === "submitted" || assignment.status === "checked"
                              ? `Added: ${assignment.submittedDate ? new Date(assignment.submittedDate).toLocaleDateString() : "N/A"}`
                              : `Due: ${assignment.dueDate || "N/A"}`}
                          </span>
                        </div>
                        
                        {assignment.status === "checked" && assignment.obtainedMarks !== undefined && (
                          <div className="flex items-center gap-3 py-3 px-4 bg-[#0d1f5c]/5 rounded-xl text-sm font-black text-[#0d1f5c]">
                            <Star className="h-4 w-4 text-[#d4940a] fill-[#d4940a]" />
                            <span>Score: {assignment.obtainedMarks} / {assignment.totalMarks}</span>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="pt-0 px-6 pb-6 relative z-10">
                        {assignment.status === "notsubmitted" ? (
                          <Button
                            onClick={() => openSubmitDialog(assignment)}
                            disabled={duePassed}
                            className={`w-full h-12 rounded-xl font-black text-sm transition-all duration-300 ${
                              duePassed 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-[#0d1f5c] text-white hover:bg-[#d4940a] hover:shadow-[0_8px_20px_rgba(212,148,10,0.3)]"
                            }`}
                          >
                            {duePassed ? "Due Date Passed" : "Submit Assignment"}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl border-gray-200 font-black text-sm text-[#0d1f5c] hover:bg-gray-50 hover:border-[#0d1f5c] transition-all"
                            onClick={() => handleViewSubmission(assignment)}
                            disabled={duePassed}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Records
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Submit Assignment Dialog */}
      {isSubmitDialogOpen && submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Submit Assignment</h2>
                <button
                  onClick={() => setIsSubmitDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Assignment Info */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">{submittingAssignment.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{submittingAssignment.description}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
                  <Clock className="h-4 w-4" />
                  <span>Due: {submittingAssignment.dueDate}</span>
                </div>
                {/* Assignment File - Show for download before submission */}
                {submittingAssignment.fileUrl && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Assignment File:</p>
                    <a
                      href={submittingAssignment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span className="font-medium">View/Download Assignment File</span>
                    </a>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (Required)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    id="submission-file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="submission-file" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <File className="h-5 w-5" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Click to select a file</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Text Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Notes (Optional)
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Enter any notes or comments about your submission..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={4}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={uploading || (!selectedFile && !submissionText.trim())}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {uploading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Submission Dialog */}
      {isDialogOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Assignment Submission</h2>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Assignment Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-900">{selectedAssignment.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedAssignment.description}</p>
                <div className="flex gap-4 mt-3">
                  <Badge variant="secondary">{selectedAssignment.courseCode || "Course"}</Badge>
                  <Badge className={selectedAssignment.status === "checked" ? "bg-green-600" : "bg-blue-600"}>
                    {selectedAssignment.status === "checked" ? "Checked" : "Submitted"}
                  </Badge>
                </div>
                {/* Original Assignment File - Show even after submission */}
                {selectedAssignment.fileUrl && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Original Assignment:</p>
                    <a
                      href={selectedAssignment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span className="font-medium">View/Download Original Assignment</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Submission Status */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Submission Details</h4>
                
                {/* Submitted Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <CalendarDays className="h-4 w-4" />
                  <span>Submitted on: {selectedAssignment.submittedDate ? new Date(selectedAssignment.submittedDate).toLocaleString() : "N/A"}</span>
                </div>

                {/* Marks (if checked) */}
                {selectedAssignment.status === "checked" && selectedAssignment.obtainedMarks !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Marks Obtained: <strong>{selectedAssignment.obtainedMarks}</strong> / {selectedAssignment.totalMarks}</span>
                  </div>
                )}

                {/* Feedback (if available) */}
                {selectedAssignment.feedback && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">Feedback</span>
                    </div>
                    <p className="text-sm text-blue-800">{selectedAssignment.feedback}</p>
                  </div>
                )}
              </div>

              {/* Submission Text */}
              {selectedAssignment.submissionText && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Submission Notes</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAssignment.submissionText}</p>
                  </div>
                </div>
              )}

              {/* Submitted File */}
              {selectedAssignment.submissionFileUrl && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Attached File</h4>
                  <a
                    href={selectedAssignment.submissionFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <File className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm text-indigo-600 font-medium">
                      {getFileName(selectedAssignment.submissionFileUrl)}
                    </span>
                  </a>
                </div>
              )}

              {/* No submission data message */}
              {!selectedAssignment.submissionText && !selectedAssignment.submissionFileUrl && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">No submission data available.</p>
                </div>
              )}

              {/* Teacher Feedback */}
              {selectedAssignment.teacherName && (
                <div className="text-sm text-gray-500 mt-4 pt-4 border-t">
                  <p>Checked by: {selectedAssignment.teacherName}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
