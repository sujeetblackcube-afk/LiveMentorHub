"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Video,
  Clock,
  Users,
  Calendar,
  Play,
  Bell,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { API_AUTH_BASE, STUDENT_PATHS } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import { UnauthenticatedPlacard } from "@/components/dashboard/UnauthenticatedPlacard";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic import with ssr: false to prevent SSR issues with AgoraRTC
const StudentLiveVideo = dynamic(
  () => import("@/components/layout/StudentLiveVideo"),
  { ssr: false }
);

// Type for Live Session from API
interface LiveSession {
  id: string;
  sessionId: string;
  courseName: string;
  courseCode: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  startTime: string;
  endTime: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  recordingUrl: string | null;
  totalStudentsJoined: number;
  platform: string;
}

export default function LivePage() {
  const [activeTab, setActiveTab] = useState<
    "ongoing" | "upcoming" | "completed"
  >("ongoing");
  const router = useRouter();
  
  // Separate state for each tab
  const [ongoingSessions, setOngoingSessions] = useState<LiveSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<LiveSession[]>([]);
  
  // Loading states for each tab
  const [loadingOngoing, setLoadingOngoing] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  
  // Error states for each tab
  const [errorOngoing, setErrorOngoing] = useState<string | null>(null);
  const [errorUpcoming, setErrorUpcoming] = useState<string | null>(null);
  const [errorCompleted, setErrorCompleted] = useState<string | null>(null);
  
  // State for live video modal
  const [showLiveVideo, setShowLiveVideo] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{
    sessionId: string;
    studentId: string;
  } | null>(null);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Get studentId from auth store or localStorage
  const getStudentId = (): string => {
    if (user?.studentId) return user.studentId;
    if (typeof window !== "undefined") {
      return localStorage.getItem("studentId") || "";
    }
    return "";
  };

  // Fetch live sessions for a specific status
  const fetchLiveSessionsByStatus = async (status: string) => {
    const studentId = getStudentId();
    if (!studentId) {
      const msg = "Please login to view live sessions";
      if (status === "ongoing") setErrorOngoing(msg);
      if (status === "upcoming") setErrorUpcoming(msg);
      if (status === "completed") setErrorCompleted(msg);
      return;
    }

    // Set loading state for the specific tab
    if (status === "ongoing") setLoadingOngoing(true);
    if (status === "upcoming") setLoadingUpcoming(true);
    if (status === "completed") setLoadingCompleted(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;
      const url = `${API_AUTH_BASE}${STUDENT_PATHS.getLiveSessions(studentId, status)}`;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error("Failed to load live sessions");

      const data = await response.json();
      const sessions = data.status && data.data ? data.data : [];

      if (status === "ongoing") { setOngoingSessions(sessions); setErrorOngoing(null); }
      else if (status === "upcoming") { setUpcomingSessions(sessions); setErrorUpcoming(null); }
      else if (status === "completed") { setCompletedSessions(sessions); setErrorCompleted(null); }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load live sessions";
      if (status === "ongoing") { setErrorOngoing(errorMessage); setOngoingSessions([]); }
      else if (status === "upcoming") { setErrorUpcoming(errorMessage); setUpcomingSessions([]); }
      else if (status === "completed") { setErrorCompleted(errorMessage); setCompletedSessions([]); }
    } finally {
      if (status === "ongoing") setLoadingOngoing(false);
      if (status === "upcoming") setLoadingUpcoming(false);
      if (status === "completed") setLoadingCompleted(false);
    }
  };

  useEffect(() => {
    const fetchAllTabs = async () => {
      setInitialLoading(true);
      await Promise.all([
        fetchLiveSessionsByStatus("ongoing"),
        fetchLiveSessionsByStatus("upcoming"),
        fetchLiveSessionsByStatus("completed")
      ]);
      setInitialLoading(false);
    };
    fetchAllTabs();
  }, []);

  const getCurrentTabData = () => {
    switch (activeTab) {
      case "ongoing": return { sessions: ongoingSessions, loading: loadingOngoing, error: errorOngoing };
      case "upcoming": return { sessions: upcomingSessions, loading: loadingUpcoming, error: errorUpcoming };
      case "completed": return { sessions: completedSessions, loading: loadingCompleted, error: errorCompleted };
      default: return { sessions: [], loading: false, error: null };
    }
  };

  const getTabCount = (tab: "ongoing" | "upcoming" | "completed"): number => {
    switch (tab) {
      case "ongoing": return ongoingSessions.length;
      case "upcoming": return upcomingSessions.length;
      case "completed": return completedSessions.length;
      default: return 0;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMins = Math.round((end.getTime() - start.getTime()) / 60000);
    return diffMins >= 60 ? `${Math.floor(diffMins / 60)}h ${diffMins % 60}m` : `${diffMins}m`;
  };

  const getThumbnailGradient = (courseName: string): string => {
    const gradients = ["from-blue-500 to-indigo-600", "from-purple-500 to-pink-600", "from-green-500 to-teal-600", "from-orange-500 to-red-600"];
    return gradients[courseName.length % gradients.length];
  };

  const getInstructorInitials = (name: string): string => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleJoinClass = (session: LiveSession) => {
    const studentId = getStudentId();
    if (!studentId) return;
    setSelectedSession({ sessionId: session.sessionId, studentId });
    setShowLiveVideo(true);
  };

  const handleCloseLiveVideo = () => {
    setShowLiveVideo(false);
    setSelectedSession(null);
    fetchLiveSessionsByStatus("ongoing");
  };

  const handleRetry = () => fetchLiveSessionsByStatus(activeTab);

  const { sessions: currentSessions, error: currentError } = getCurrentTabData();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-16"
    >

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0d1f5c] tracking-tight">Live Classes</h1>
          <p className="text-gray-600 font-medium mt-1.5 text-[15px]">Join live sessions and interact with instructors in real-time</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 relative">
        {(["ongoing", "upcoming", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-black transition-all relative ${activeTab === tab ? "text-[#0d1f5c]" : "text-gray-400 hover:text-gray-600"}`}
          >
            <span className="flex items-center gap-2">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <Badge className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === tab ? (tab === 'ongoing' ? 'bg-red-500' : 'bg-[#d4940a]') + " text-white" : "bg-gray-100 text-gray-500"}`}>
                {initialLoading ? "..." : getTabCount(tab)}
              </Badge>
            </span>
            {activeTab === tab && (
              <motion.div layoutId="live-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#d4940a] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {!isAuthenticated ? (
        <UnauthenticatedPlacard icon={Video} sectionName="live classes" />
      ) : initialLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-10 w-10 border-4 border-[#d4940a]/20 border-t-[#d4940a] rounded-full animate-spin" />
          <p className="text-gray-500 font-bold text-sm">Synchronizing live streams...</p>
        </div>
      ) : currentError ? (
        <Card className="border-dashed border-2 border-gray-100 bg-gray-50/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Video className="h-10 w-10 text-red-300 mb-6" />
            <h3 className="text-xl font-bold text-[#0d1f5c] mb-2">Connection Notice</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-8 font-medium italic">{currentError}</p>
            <Button variant="outline" onClick={handleRetry} className="rounded-xl border-[#d4940a] text-[#d4940a] font-black h-11 px-8 hover:bg-[#d4940a] hover:text-white transition-all">Reconnect</Button>
          </CardContent>
        </Card>
      ) : currentSessions.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {currentSessions.map((session, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                key={session.id}
              >
                <Card className="h-full bg-white rounded-2xl border border-gray-100 p-1 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col active:scale-95">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_40px_rgba(13,31,92,0.05)_inset]" />
                  <div className="relative h-48 rounded-xl overflow-hidden mb-2">
                    {session.thumbnailUrl ? (
                      <img src={session.thumbnailUrl.startsWith('http') ? session.thumbnailUrl : `${API_AUTH_BASE}${session.thumbnailUrl}`} alt={session.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getThumbnailGradient(session.courseName)} flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform duration-700`}>
                        <Video className="h-16 w-16 text-white/30" strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                    {session.status === "ongoing" && (
                      <Badge className="absolute top-4 left-4 bg-red-600 text-white border-0 font-black text-[10px] tracking-tight backdrop-blur-md shadow-lg flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-white animate-ping" />LIVE NOW
                      </Badge>
                    )}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                      <Users className="h-3.5 w-3.5 text-white" />
                      <span className="text-xs font-black text-white">{session.totalStudentsJoined} joining</span>
                    </div>
                  </div>

                  <CardHeader className="pb-3 px-5 pt-4 space-y-2 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <Badge className="bg-[#d4940a]/10 text-[#d4940a] border-0 px-3 py-1 font-bold text-[11px]">{session.courseName}</Badge>
                      <span className="text-[11px] font-bold text-gray-400">{formatDate(session.startTime)}</span>
                    </div>
                    <h3 className="font-extrabold text-[#0d1f5c] text-[17px] leading-tight group-hover:text-[#d4940a] transition-all duration-300">{session.title}</h3>
                  </CardHeader>

                  <CardContent className="px-5 pb-5 space-y-5 relative z-10 flex-1">
                    <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-xl group-hover:bg-[#0d1f5c]/5 transition-colors duration-500">
                      <div className="h-9 w-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-[#0d1f5c] shadow-sm">{getInstructorInitials(session.teacherName)}</div>
                      <span className="text-sm font-bold text-[#0d1f5c] opacity-80">{session.teacherName}</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2.5 text-xs font-bold text-gray-500"><Clock className="h-4 w-4 text-[#d4940a]" /><span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span></div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-5 pb-5 pt-0 relative z-10">
                    {session.status === "ongoing" && (
                      <Button className="w-full bg-[#0d1f5c] hover:bg-[#d4940a] text-white font-black h-12 rounded-xl transition-all duration-300" onClick={() => handleJoinClass(session)}><Play className="h-4 w-4 mr-2" />Join Interactive Hub</Button>
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
            <Video className="h-10 w-10 text-gray-300 mb-6" />
            <h3 className="text-xl font-bold text-[#0d1f5c] mb-2">Empty Broadcast Room</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-8 font-medium italic">No live sessions in this category yet.</p>
            <Button className="bg-[#0d1f5c] hover:bg-[#d4940a] text-white font-black h-12 rounded-xl px-8 transition-all duration-300"><Calendar className="h-4 w-4 mr-2" />View Schedule</Button>
          </CardContent>
        </Card>
      )}

      {showLiveVideo && selectedSession && (
        <StudentLiveVideo
          sessionId={selectedSession.sessionId}
          studentId={selectedSession.studentId}
          onClose={handleCloseLiveVideo}
        />
      )}

    </motion.div>
  );
}
