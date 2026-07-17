"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FileCheck, BookOpenCheck, ClipboardList, TrendingUp, Award, Target, Rocket } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { API_BASE, PROGRESS_PATHS } from "@/lib/api";
import { UnauthenticatedPlacard } from "@/components/dashboard/UnauthenticatedPlacard";
import { useAuth } from "@/store/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/layout/Footer";

interface ApiProgressData {
  studentId: string;
  testsAllotted: number;
  testsSubmitted: number;
  testsNotSubmitted: number;
  assignmentsAllotted: number;
  assignmentsSubmitted: number;
  assignmentsNotSubmitted: number;
  submittedTests: Array<{
    id: number;
    testId: number;
    title: string;
    status: string;
    obtainedMarks: number;
    percentage: number;
    submittedAt: string;
  }>;
  submittedAssignments: Array<{
    id: string;
    assignmentId: string;
    title: string;
    status: string;
    obtainedMarks: number;
    percentage: number;
    submittedAt: string;
  }>;
}

interface ComputedProgressData {
  studentId: string;
  totalAssignments: number;
  assignmentPercentage: number;
  totalTests: number;
  testPercentage: number;
  totalSubmissions: number;
  progress: number;
}

export default function ProgressPage() {
  const { isAuthenticated } = useAuth();
  const [apiData, setApiData] = useState<ApiProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId =
      typeof window !== "undefined" ? localStorage.getItem("studentId") : "";

    if (studentId) {
      setLoading(true);
      fetch(`${API_BASE}${PROGRESS_PATHS.getProgress(studentId)}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.status && res.data) {
            setApiData(res.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Progress fetch error:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-12 w-12 border-4 border-[#d4940a]/20 border-t-[#d4940a] rounded-full animate-spin" />
        <p className="text-[#0d1f5c] font-black text-sm tracking-widest uppercase">Analyzing Performance...</p>
      </div>
    );
  }

// Compute display data from API data or fallback
  const computeDisplayData = (apiData: ApiProgressData): ComputedProgressData => {
    const assignmentPercentage = apiData.assignmentsAllotted > 0 
      ? Math.round((apiData.assignmentsSubmitted / apiData.assignmentsAllotted) * 100)
      : 0;
    const testPercentage = apiData.testsAllotted > 0 
      ? Math.round((apiData.testsSubmitted / apiData.testsAllotted) * 100)
      : 0;
    const progress = Math.round((assignmentPercentage * 0.5 + testPercentage * 0.5));
    
    return {
      studentId: apiData.studentId,
      totalAssignments: apiData.assignmentsAllotted,
      assignmentPercentage,
      totalTests: apiData.testsAllotted,
      testPercentage,
      totalSubmissions: apiData.assignmentsSubmitted + apiData.testsSubmitted,
      progress,
    };
  };

  const displayData = apiData ? computeDisplayData(apiData) : {
    progress: 0,
    totalAssignments: 0,
    assignmentPercentage: 0,
    totalTests: 0,
    testPercentage: 0,
    totalSubmissions: 0,
  } as ComputedProgressData;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-16"
    >

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0d1f5c] tracking-tight">
            Academic Performance
          </h1>
          <p className="text-gray-600 font-medium mt-1.5 text-[15px]">
            Real-time analytics of your learning journey and milestones
          </p>
        </div>
      </div>

      {/* Top Level Metrics */}
      {!isAuthenticated ? (
        <UnauthenticatedPlacard icon={Rocket} sectionName="learning progress" />
      ) : (
        <>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
        {/* Overall Progress */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="p-8 flex flex-col items-center bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp size={80} className="text-[#0d1f5c]" />
            </div>
            <div className="w-32 h-32 mb-6">
              <CircularProgressbar
                value={Math.min(displayData.progress, 100)}
                text={`${Math.round(displayData.progress)}%`}
                styles={buildStyles({
                  pathColor: "#d4940a",
                  textColor: "#0d1f5c",
                  trailColor: "#f1f5f9",
                  strokeLinecap: "round",
                  textSize: "22px",
                })}
              />
            </div>
            <h3 className="text-[#0d1f5c] font-black text-sm uppercase tracking-wider mb-1">Overall Velocity</h3>
            <p className="text-gray-400 text-xs font-bold">Course Completion Rate</p>
          </Card>
        </motion.div>

        {/* Assignments Stat */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Award size={60} className="text-[#d4940a]" />
            </div>
            <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#d4940a]/10 transition-colors">
              <FileCheck className="text-emerald-600 group-hover:text-[#d4940a] transition-colors" size={28} />
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Assignments</p>
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-4xl font-black text-[#0d1f5c]">{displayData.totalAssignments}</p>
              <span className="text-xs font-bold text-gray-400">Issued</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${displayData.assignmentPercentage}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase">
                <span>Success Rate</span>
                <span className="text-emerald-600">{displayData.assignmentPercentage}%</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tests Stat */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Target size={60} className="text-[#0d1f5c]" />
            </div>
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0d1f5c]/5 transition-colors">
              <BookOpenCheck className="text-blue-600 group-hover:text-[#0d1f5c] transition-colors" size={28} />
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Assessments</p>
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-4xl font-black text-[#0d1f5c]">{displayData.totalTests}</p>
              <span className="text-xs font-bold text-gray-400">Cleared</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${displayData.testPercentage}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase">
                <span>Accuracy</span>
                <span className="text-blue-600">{displayData.testPercentage}%</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Submissions Stat */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="p-8 bg-[#0d1f5c] rounded-[2rem] border-0 shadow-[0_20px_40px_rgba(13,31,92,0.2)] h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <Rocket size={80} className="text-white" />
            </div>
            <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <ClipboardList className="text-[#d4940a]" size={28} strokeWidth={3} />
            </div>
            <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-1">Total Submissions</p>
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-4xl font-black text-white">{displayData.totalSubmissions}</p>
              <span className="text-xs font-bold text-white/40">Reports</span>
            </div>
            <p className="text-[11px] text-white/40 font-bold leading-relaxed">
              Consolidated work history across all active enrollments.
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <Card className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-[#0d1f5c] text-lg uppercase tracking-tight">
              Assignment Milestone
            </h3>
            <Badge className="bg-emerald-50 text-emerald-600 border-0 font-bold">On Track</Badge>
          </div>

          <div className="relative h-6 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center px-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${displayData.assignmentPercentage}%` }}
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-r-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            />
            <span className="relative z-10 text-[10px] font-black text-white ml-2 drop-shadow-md">
              {displayData.assignmentPercentage}% COMPLETE
            </span>
          </div>
          <div className="mt-4 flex justify-between text-[11px] font-bold text-gray-400">
            <span>START</span>
            <span>GOAL: 100%</span>
          </div>
        </Card>

        <Card className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-[#0d1f5c] text-lg uppercase tracking-tight">
              Test Accuracy Goal
            </h3>
            <Badge className="bg-blue-50 text-blue-600 border-0 font-bold">In Progress</Badge>
          </div>

          <div className="relative h-6 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center px-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${displayData.testPercentage}%` }}
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-r-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            />
            <span className="relative z-10 text-[10px] font-black text-white ml-2 drop-shadow-md">
              {displayData.testPercentage}% ACCURACY
            </span>
          </div>
          <div className="mt-4 flex justify-between text-[11px] font-bold text-gray-400">
            <span>CURRENT</span>
            <span>TARGET: 90%</span>
          </div>
        </Card>
          </div>
        </>
      )}

    </motion.div>
  );
}