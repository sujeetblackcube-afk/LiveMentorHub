"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Clock,
  CheckCircle2,
  Play,
  FileText,
  Star,
  AlertCircle,
  ChevronRight,
  Target,
  Trophy,
  History,
  Timer
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/store/useAuth";
import { API_BASE, TEST_PATHS } from "@/lib/api";
import { UnauthenticatedPlacard } from "@/components/dashboard/UnauthenticatedPlacard";
import { motion, AnimatePresence } from "framer-motion";

type TestStatus = "NOTSUBMITTED" | "SUBMITTED" | "GRADED";

interface QuestionDetail {
  id: number;
  questionText: string;
  questionType: string;
  answer?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  marks: number;
}

interface TestData {
  submissionId: number;
  testId: number;
  studentId: string;
  attemptNumber: number;
  answers: any[] | null;
  obtainedMarks: number;
  percentage: number;
  status: TestStatus;
  submittedAt: string | null;
  createdAt: string;
  test: {
    title: string;
    description: string | null;
    totalMarks: number;
    durationMinutes: number;
    startTime: string;
    endTime: string;
    maxAttempts: number;
    isPublished: boolean;
    courseCode: string;
    questionDetails: QuestionDetail[];
  };
  teacher: {
    teacherId: string;
    teacherName: string;
  } | null;
}

export default function TestsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TestStatus>("NOTSUBMITTED");
  const [tests, setTests] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const studentId =
    user?.studentId ||
    (typeof window !== "undefined" && localStorage.getItem("studentId")) ||
    "";
  const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : "";

  useEffect(() => {
    if (studentId && token) {
      fetchTests();
    } else {
       // Demo data for non-authenticated users if needed, 
       // but handle via SectionBanner's logic
    }
  }, [studentId, token]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_BASE}${TEST_PATHS.getTestsByStudent(studentId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const testsArray = Array.isArray(res.data.tests) ? res.data.tests : [];
      setTests(testsArray);
    } catch (err: any) {
      console.error("Failed to fetch tests:", err);
      setError(err.response?.data?.message || "Failed to load tests.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (test: TestData) => {
    router.push(`/tests/${test.testId}?submissionId=${test.submissionId}`);
  };

  const handleRetakeTest = (test: TestData) => {
    router.push(`/tests/${test.testId}?submissionId=${test.submissionId}&retake=true`);
  };

  const filteredTests = tests.filter((t) => t.status === activeTab);

  const stats = {
    NOTSUBMITTED: tests.filter((t) => t.status === "NOTSUBMITTED").length,
    SUBMITTED: tests.filter((t) => t.status === "SUBMITTED").length,
    GRADED: tests.filter((t) => t.status === "GRADED").length,
  };

  const isTestAvailable = (test: TestData) => {
    const now = new Date();
    const startTime = new Date(new Date(test.test.startTime).getTime() - 5.5 * 60 * 60 * 1000);
    const endTime = new Date(new Date(test.test.endTime).getTime() - 5.5 * 60 * 60 * 1000);
    return now >= startTime && now <= endTime;
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(new Date(endTime).getTime() - 5.5 * 60 * 60 * 1000);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
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
          <h1 className="text-3xl font-extrabold text-[#0d1f5c] tracking-tight">Assessments</h1>
          <p className="text-gray-600 font-medium mt-1.5 text-[15px]">Validate your expertise through rigorous examination</p>
        </div>
      </div>

      {/* Stats Selectors */}
      <div className="grid gap-6 md:grid-cols-3">
        {(["NOTSUBMITTED", "SUBMITTED", "GRADED"] as TestStatus[]).map((status) => {
          const isActive = activeTab === status;
          const config = {
            NOTSUBMITTED: { label: "Pending", icon: History, color: "#d4940a" },
            SUBMITTED: { label: "Evaluating", icon: Target, color: "#0d1f5c" },
            GRADED: { label: "Results", icon: Trophy, color: "#10b981" }
          }[status];

          return (
            <motion.div
              key={status}
              onClick={() => setActiveTab(status)}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
            >
              <Card className={`p-6 bg-white rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden group ${
                isActive ? "border-[#d4940a] shadow-[0_20px_40px_rgba(212,148,10,0.1)]" : "border-gray-100 hover:border-gray-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                   <div className={`p-3 rounded-2xl ${isActive ? "bg-[#d4940a]/10" : "bg-gray-50"}`}>
                    <config.icon className={`h-6 w-6 ${isActive ? "text-[#d4940a]" : "text-gray-400"}`} />
                  </div>
                  <Badge className={`rounded-full px-3 py-1 text-xs font-black ${isActive ? "bg-[#d4940a] text-white" : "bg-gray-100 text-gray-500"}`}>
                    {loading && !isAuthenticated ? "0" : stats[status]}
                  </Badge>
                </div>
                <h3 className={`text-sm font-black uppercase tracking-widest ${isActive ? "text-[#0d1f5c]" : "text-gray-400"}`}>
                  {config.label}
                </h3>
                <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 bg-[#d4940a] ${isActive ? "w-full" : "w-0"}`} />
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Tests Content */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-[#0d1f5c] tracking-tight flex items-center gap-2">
          {activeTab === "NOTSUBMITTED" ? "Open for Examination" : activeTab === "SUBMITTED" ? "Awaiting Grading" : "Academic Achievements"}
          <div className="h-1 flex-1 bg-gray-100 rounded-full ml-2" />
        </h2>

        {!isAuthenticated ? (
          <UnauthenticatedPlacard icon={FileText} sectionName="assessments" />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 border-4 border-[#d4940a]/20 border-t-[#d4940a] rounded-full animate-spin" />
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Retrieving Questionnaires...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="border-dashed border-2 border-gray-100 bg-gray-50/30">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-[#0d1f5c] mb-2 uppercase tracking-tighter">
                  No Current Records Found
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6 font-medium italic">
                  {activeTab === "NOTSUBMITTED"
                    ? "Your desk is clear! No active tests assigned to your profile today."
                    : "Your evaluation history is currently empty for this category."}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredTests.map((test, index) => {
                const available = isTestAvailable(test);
                const isAttemptAvailable = test.attemptNumber < test.test.maxAttempts;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    key={test.submissionId}
                  >
                    <Card className="h-full bg-white rounded-2xl border border-gray-100 p-1 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col active:scale-95">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_40px_rgba(13,31,92,0.05)_inset]" />
                      
                      <CardHeader className="pb-4 pt-6 px-6 relative z-10 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-[#0d1f5c]/5 text-[#0d1f5c] border-0 px-3 py-1 font-black text-[10px] tracking-tight uppercase">
                            {test.test.courseCode}
                          </Badge>
                          {test.status === "NOTSUBMITTED" ? (
                            <Badge className={`${available ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"} border-0 px-2 py-0.5 font-bold text-[10px]`}>
                              {available ? "OPEN" : "CLOSED"}
                            </Badge>
                          ) : (
                            <Badge className={`${test.status === "SUBMITTED" ? "bg-[#d4940a]/10 text-[#d4940a]" : "bg-[#0d1f5c] text-white"} border-0 px-2 py-0.5 font-bold text-[10px]`}>
                              {test.status}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-extrabold text-[#0d1f5c] text-[17px] leading-tight group-hover:text-[#d4940a] transition-all duration-300">
                          {test.test.title}
                        </h3>
                        <p className="text-[13px] text-gray-500 font-medium leading-relaxed line-clamp-2 italic">
                          {test.test.description || "In-depth course evaluation assessment."}
                        </p>
                      </CardHeader>

                      <CardContent className="px-6 pb-6 space-y-5 relative z-10 flex-1">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded-xl flex flex-col gap-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</span>
                            <div className="flex items-center gap-1.5 text-[#0d1f5c] font-bold text-sm">
                              <Timer className="h-3.5 w-3.5" />
                              {test.test.durationMinutes}m
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl flex flex-col gap-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valuation</span>
                            <div className="flex items-center gap-1.5 text-[#0d1f5c] font-bold text-sm">
                              <Target className="h-3.5 w-3.5" />
                              {test.test.totalMarks} Marks
                            </div>
                          </div>
                        </div>

                        {test.status === "GRADED" && (
                          <div className="bg-[#0d1f5c] rounded-xl p-4 flex items-center justify-between text-white shadow-lg shadow-[#0d1f5c]/20">
                            <div>
                              <p className="text-[10px] font-bold text-white/50 uppercase mb-1">Score Achieved</p>
                              <p className="text-xl font-black">{test.obtainedMarks} <span className="text-xs text-white/40">/ {test.test.totalMarks}</span></p>
                            </div>
                            <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                              <span className="text-xs font-black text-[#d4940a]">{test.percentage}%</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 px-1">
                          <History className="h-3.5 w-3.5 text-[#d4940a]" />
                          Attempt Limit: {test.attemptNumber} / {test.test.maxAttempts}
                        </div>

                        {test.status === "NOTSUBMITTED" && available && (
                          <div className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg animate-pulse">
                            <Clock className="h-3.5 w-3.5" />
                            CLOSING IN: {getTimeRemaining(test.test.endTime)}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="px-6 pb-6 pt-0 relative z-10">
                        {test.status === "NOTSUBMITTED" ? (
                          <Button
                            onClick={() => handleStartTest(test)}
                            disabled={!available}
                            className={`w-full h-12 rounded-xl font-black text-sm transition-all duration-300 shadow-md ${
                              available
                                ? "bg-[#0d1f5c] hover:bg-[#d4940a] text-white hover:shadow-[0_8px_20px_rgba(212,148,10,0.3)]"
                                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                            }`}
                          >
                            {available ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Begin Examination
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Locked Access
                              </>
                            )}
                          </Button>
                        ) : test.status === "SUBMITTED" ? (
                          <Button
                            onClick={() => handleStartTest(test)}
                            variant="outline"
                             className="w-full h-12 rounded-xl border-[#0d1f5c] font-black text-[#0d1f5c] hover:bg-[#0d1f5c] hover:text-white transition-all duration-300 shadow-sm"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Review Responses
                          </Button>
                        ) : test.status === "GRADED" ? (
                          isAttemptAvailable ? (
                             <Button
                              onClick={() => handleRetakeTest(test)}
                              className="w-full h-12 rounded-xl bg-[#0d1f5c] hover:bg-[#d4940a] text-white font-black transition-all duration-300 shadow-md"
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Next Attempt ({test.attemptNumber + 1})
                            </Button>
                          ) : (
                            <Button variant="outline" className="w-full h-12 rounded-xl border-gray-200 font-bold text-gray-400 cursor-not-allowed" disabled>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Terminal Attempt Reached
                            </Button>
                          )
                        ) : null}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </motion.div>
  );
}
