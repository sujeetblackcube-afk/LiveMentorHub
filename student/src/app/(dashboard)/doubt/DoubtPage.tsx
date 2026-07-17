"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Clock,
  CheckCircle2,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Footer } from "@/components/layout/Footer";

import { CREATE_DOUBT, GET_DOUBT, API_AUTH_BASE } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import { useCoursePageData } from "@/lib/courseData";
import { UnauthenticatedPlacard } from "@/components/dashboard/UnauthenticatedPlacard";
import { motion, AnimatePresence } from "framer-motion";

interface Doubt {
  id: number;
  doubtTitle: string;
  doubtText: string;
  courseName: string;
  courseCode: string;
  teacherName?: string;
  answerText: string;
  status: "notreplied" | "replied";
  createdAt: string;
}

export default function DoubtPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const studentId =
    user?.studentId ||
    (typeof window !== "undefined" && localStorage.getItem("studentId")) ||
    "";

  const { myCourses } = useCoursePageData(studentId);

  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [open, setOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ================= FETCH DOUBTS =================
  const fetchDoubts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!studentId) {
        setError("Please login to view doubts");
        setDoubts([]);
        return;
      }

      const token = localStorage.getItem("cp_token");

      const res = await fetch(
        `${API_AUTH_BASE}${GET_DOUBT.getDoubt(studentId)}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!res.ok) {
        setError("Failed to load doubts");
        return;
      }

      const data = await res.json();
      setDoubts(data.data || []);
    } catch (err) {
      setError("Failed to load doubts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, [studentId]);

  // debug: log courses coming from hook
  useEffect(() => {
  }, [myCourses]);


  // ================= FILTER =================
  const pendingCount = doubts.filter((d) => d.status === "notreplied").length;
  const resolvedCount = doubts.filter((d) => d.status === "replied").length;

  const filtered = doubts.filter((d) =>
    activeTab === "pending"
      ? d.status === "notreplied"
      : d.status === "replied"
  );

  // ================= CREATE DOUBT =================
  const handleCreateDoubt = async () => {
    if (!courseCode || !title || !text) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("cp_token");

      const url = `${API_AUTH_BASE}${CREATE_DOUBT.createDoubt}`;
      const payload = {
        studentId,
        courseCode,
        doubtTitle: title,
        doubtText: text,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create doubt failed:", res.status, text);
        alert("Failed to create doubt");
        return;
      }

      // Reset form
      setOpen(false);
      setTitle("");
      setText("");
      setCourseCode("");

      fetchDoubts();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-16"
    >

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0d1f5c] tracking-tight">
            Doubts & Questions
          </h1>
          <p className="text-gray-600 font-medium mt-1.5 text-[15px]">
            Ask your course related doubts and get instructor help
          </p>
        </div>

        <Button
          className="bg-[#0d1f5c] hover:bg-[#d4940a] text-white font-black rounded-xl h-12 px-6 transition-all duration-300 shadow-md hover:shadow-[0_8px_20px_rgba(212,148,10,0.3)]"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
          Ask New Doubt
        </Button>
      </div>

      {/* TABS */}
      <div className="flex gap-8 relative">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-4 text-sm font-black transition-all relative ${
            activeTab === "pending"
              ? "text-[#0d1f5c]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className="flex items-center gap-2">
            Pending
            <Badge className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === 'pending' ? 'bg-[#d4940a] text-white' : 'bg-gray-100 text-gray-500'}`}>
              {pendingCount}
            </Badge>
          </span>
          {activeTab === "pending" && (
            <motion.div 
              layoutId="doubt-tab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-[#d4940a] rounded-full" 
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("resolved")}
          className={`pb-4 text-sm font-black transition-all relative ${
            activeTab === "resolved"
              ? "text-[#0d1f5c]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className="flex items-center gap-2">
            Resolved
            <Badge className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {resolvedCount}
            </Badge>
          </span>
          {activeTab === "resolved" && (
            <motion.div 
              layoutId="doubt-tab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-[#d4940a] rounded-full" 
            />
          )}
        </button>
      </div>

      {/* CONTENT */}
      {!isAuthenticated ? (
        <UnauthenticatedPlacard icon={MessageCircle} sectionName="doubt solving" />
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-10 w-10 border-4 border-[#d4940a]/20 border-t-[#d4940a] rounded-full animate-spin" />
          <p className="text-gray-500 font-bold text-sm">Loading conversations...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((doubt, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                key={doubt.id}
              >
                <Card className="h-full bg-white rounded-2xl border border-gray-100 p-1 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col">
                   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_40px_rgba(13,31,92,0.05)_inset]" />
                   
                  <CardHeader className="pb-4 pt-6 px-6 relative z-10">
                    <Badge className="w-fit bg-[#0d1f5c]/5 text-[#0d1f5c] border-0 px-3 py-1 font-bold mb-3">
                      {doubt.courseName}
                    </Badge>
                    <h3 className="font-bold text-[#0d1f5c] text-[17px] leading-tight group-hover:text-[#d4940a] transition-all duration-300">
                      {doubt.doubtTitle}
                    </h3>
                  </CardHeader>

                  <CardContent className="flex-1 px-6 pb-6 relative z-10">
                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-4">
                      {doubt.doubtText}
                    </p>

                    {doubt.status === "replied" && doubt.answerText && (
                      <div className="mt-4 border-t border-gray-50 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-[#d4940a]/10 rounded-full flex items-center justify-center border border-[#d4940a]/20">
                            <span className="text-[#d4940a] font-black text-[10px]">PROF</span>
                          </div>
                          <div>
                            <p className="font-extrabold text-[#0d1f5c] text-xs">Instructor Answer</p>
                          </div>
                        </div>
                        <div className="bg-[#fcf8ef] border border-[#f5d070]/30 rounded-xl p-4">
                          <p className="text-[#5c4a16] text-[13px] leading-relaxed font-medium">{doubt.answerText}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="px-6 pb-6 pt-0 relative z-10 mt-auto">
                    {doubt.status === "notreplied" ? (
                      <div className="flex items-center gap-2 text-orange-500 bg-orange-50 w-fit px-3 py-1 rounded-full text-[11px] font-bold">
                        <Clock className="h-3 w-3" />
                        Awaiting Response
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full text-[11px] font-extrabold">
                        <CheckCircle2 className="h-3 w-3" />
                        Issue Resolved
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-100 bg-gray-50/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-6">
              <MessageCircle className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold max-w-xs">
              No {activeTab} doubts found in this category.
            </p>
          </CardContent>
        </Card>
      )}

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 relative shadow-lg">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <h2 className="text-xl font-bold mb-4 text-[#0d1f5c]">Ask a Doubt</h2>

            {myCourses?.length === 0 ? (
              <p className="text-sm text-red-500 mb-4">
                You are not enrolled in any course.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#0d1f5c] uppercase tracking-wider">Select Course</label>
                  <select
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-[#0d1f5c] focus:outline-none focus:ring-2 focus:ring-[#d4940a]/20 transition-all"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  >
                    <option value="">Choose your course</option>
                    {myCourses?.map((course: any, idx: number) => {
                      const code = course.courseCode ?? course.id;
                      const label = `${course.title || course.courseName}${code ? ` (${code})` : ""}`;
                      return (
                        <option key={code ?? idx} value={code}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-black text-[#0d1f5c] uppercase tracking-wider">Doubt Title</label>
                  <Input
                    placeholder="Short summary of your question"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 bg-gray-50 font-bold text-[#0d1f5c]"
                  />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-black text-[#0d1f5c] uppercase tracking-wider">Description</label>
                  <Textarea
                    placeholder="Provide details about your doubt..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[120px] rounded-xl border-gray-200 bg-gray-50 font-medium text-[#0d1f5c]"
                  />
                </div>

                <Button
                  className="w-full bg-[#0d1f5c] hover:bg-[#d4940a] text-white font-black h-12 rounded-xl transition-all duration-300 shadow-md"
                  disabled={!courseCode || !title || !text || submitting}
                  onClick={handleCreateDoubt}
                >
                  {submitting ? "Submitting Doubt..." : "Post Question"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </motion.div>
  );
}
