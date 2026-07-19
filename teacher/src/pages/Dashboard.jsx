import React, { useState, useEffect } from "react";
import StatCard from "../components/Statcard";
// import { LineChart, Line, XAxis, YAxis,  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import {
  Users,
  TrendingUp,
  Clock,
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X,
  Send,
} from "lucide-react";
import { theme } from "../theme";
import { useNavigate } from "react-router-dom";
import { getImageUrl, DEFAULT_BANNER_IMAGE } from "../utils/image";
import {
  getBanners,
  BACKEND_BASE_URL,
  getTotalStudentCountForTeacher,
  getcountLiveClassesByTeacher,
  getTeacherCourseCount,
  getNotesCount,
  getTotalEarningsByTeacher,
  createContact,
} from "../services/api.js";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Banner states
  const [banners, setBanners] = useState([]);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    description: "",
    status: "active",
    image: null,
  });
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [liveClassesCount, setLiveClassesCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  // Chatbot states
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatForm, setChatForm] = useState({ subject: "", message: "" });
  const [chatSuccess, setChatSuccess] = useState(false);
  const [chatError, setChatError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch banners on component mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await getBanners();
        if (response.success) {
          setBanners(response.data);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  // Fetch student count on component mount
  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const response = await getTotalStudentCountForTeacher();
        if (response.status) {
          setStudentCount(response.studentCount);
        }
      } catch (error) {
        console.error("Error fetching student count:", error);
      }
    };

    fetchStudentCount();
  }, []);

  // Fetch live classes count on component mount
  useEffect(() => {
    const fetchLiveClassesCount = async () => {
      try {
        const response = await getcountLiveClassesByTeacher(user.teacherId);
        if (response.success) {
          setLiveClassesCount(response.total);
        }
      } catch (error) {
        console.error("Error fetching live classes count:", error);
      }
    };

    if (user?.teacherId) {
      fetchLiveClassesCount();
    }
  }, [user]);

  // Fetch course count on component mount
  useEffect(() => {
    const fetchCourseCount = async () => {
      try {
        const response = await getTeacherCourseCount(user.teacherId);
        if (response.status) {
          setCourseCount(response.courseCount);
        }
      } catch (error) {
        console.error("Error fetching course count:", error);
      }
    };

    if (user?.teacherId) {
      fetchCourseCount();
    }
  }, [user]);

  // Fetch notes count on component mount
  useEffect(() => {
    const fetchNotesCount = async () => {
      try {
        const response = await getNotesCount(user.teacherId);
        if (response.success) {
          setNotesCount(response.count);
        }
      } catch (error) {
        console.error("Error fetching notes count:", error);
      }
    };

    if (user?.teacherId) {
      fetchNotesCount();
    }
  }, [user]);

  // Fetch total earnings on component mount
  useEffect(() => {
    const fetchTotalEarnings = async () => {
      try {
        const response = await getTotalEarningsByTeacher();
        if (response.status) {
          setTotalEarnings(response.totalEarnings || 0);
        }
      } catch (error) {
        console.error("Error fetching total earnings:", error);
      }
    };

    fetchTotalEarnings();
  }, []);

  // Reset currentBannerIndex if it exceeds banners length
  useEffect(() => {
    if (currentBannerIndex >= banners.length && banners.length > 0) {
      setCurrentBannerIndex(0);
    }
  }, [banners, currentBannerIndex]);

  // Auto-slide functionality
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // Handle banner navigation
  const nextBanner = () => {
    setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex(
      (prevIndex) => (prevIndex - 1 + banners.length) % banners.length,
    );
  };

  // Format amount for display
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Handle chatbot form submission
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatForm.subject.trim() || !chatForm.message.trim()) {
      setChatError("Please enter both subject and message");
      return;
    }

    setIsSubmitting(true);
    setChatError("");

    // Get user data from localStorage (stored by AuthContext)
    const storedUser = localStorage.getItem('user');
    let userData = {};
    if (storedUser) {
      try {
        userData = JSON.parse(storedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Build contact data with user info from auth
    const contactData = {
      name: userData.name || userData.fullName || userData.teacherName || userData.firstName || "",
      email: userData.email || "",
      phone: userData.phone || userData.mobile || userData.phoneNumber || "",
      subject: chatForm.subject,
      message: chatForm.message,
      role: "teacher",
      specificId: userData.teacherId || "",
    };

    // Validate required fields
    if (!contactData.name || !contactData.email) {
      setChatError("User profile incomplete. Please update your profile with name and email.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await createContact(contactData);

      if (response.message || response.success) {
        setChatSuccess(true);
        setChatForm({ subject: "", message: "" });
        setTimeout(() => {
          setShowChatbot(false);
          setChatSuccess(false);
        }, 2000);
      } else {
        setChatError(response.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="p-2 sm:p-4 md:p-6 lg:p-8 min-h-screen"
      style={{ backgroundColor: theme.colors.secondary }}
    >
      {/* Banners Section */}
      <div className="w-full mt-4 sm:mt-6">
        {/* Banner Display Full Width */}
        <div className="relative w-full group">
          {banners.length === 0 ? (
            <div
              className="w-full rounded-2xl py-16 text-center border shadow-lg"
              style={{
                background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                borderColor: theme.colors.border,
              }}
            >
              <p
                className="text-sm sm:text-base font-medium"
                style={{ color: theme.colors.textSecondary }}
              >
                🚀 No banners available.
              </p>
            </div>
          ) : (
            <>
              {banners[currentBannerIndex] && (
                <div className="relative w-full overflow-hidden rounded-2xl shadow-xl">
                  {/* Full Width Image */}
                  {banners[currentBannerIndex].image && (
                    <img
                      src={getImageUrl(banners[currentBannerIndex].image)}
                      alt={banners[currentBannerIndex].title || "Banner"}
                      className="w-full h-40 sm:h-52 md:h-64 lg:h-72 xl:h-80 2xl:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = DEFAULT_BANNER_IMAGE;
                      }}
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Banner Title & Description */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white z-10">
                    {banners[currentBannerIndex].title && (
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
                        {banners[currentBannerIndex].title}
                      </h3>
                    )}
                    {banners[currentBannerIndex].description && (
                      <p className="text-sm sm:text-base opacity-90 max-w-2xl">
                        {banners[currentBannerIndex].description}
                      </p>
                    )}
                  </div>

                  {/* Navigation Arrows */}
                  {banners.length > 1 && (
                    <>
                      <button
                        onClick={prevBanner}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full shadow-lg bg-white/80 hover:bg-white transition"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      <button
                        onClick={nextBanner}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full shadow-lg bg-white/80 hover:bg-white transition"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      {/* Dots Indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {banners.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentBannerIndex(index)}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all"
                            style={{
                              backgroundColor:
                                index === currentBannerIndex
                                  ? "#ffffff"
                                  : "rgba(255,255,255,0.5)",
                              transform:
                                index === currentBannerIndex
                                  ? "scale(1.2)"
                                  : "scale(1)",
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        
      </div>
      {/* New Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        <StatCard
          title="Total Students"
          value={studentCount}
          positive={true}
          onClick={() => navigate("/students")}
        />
        {/* <StatCard
          title="Total Notes"
          value={notesCount}
          positive={true}
          onClick={() => navigate("/notes")}
        /> */}
        <StatCard
          title="Total Live Classes"
          value={liveClassesCount}
          positive={true}
          onClick={() => navigate("/classes")}
        />
        <StatCard
          title="Total Course"
          value={courseCount}
          positive={true}
          onClick={() => navigate("/courses")}
        />
        <StatCard
          title="Total Earning"
          value={formatAmount(totalEarnings)}
          positive={true}
          onClick={() => navigate("/earning")}
        />
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 mt-2">
        {/* LEFT SECTION */}
        <div className="space-y-6"></div>
      </div>

      {/* Floating Chatbot Button */}
      <button
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
        style={{ backgroundColor: theme.colors.primary }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Chatbot Popup */}
      {showChatbot && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border overflow-hidden">
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <h3 className="text-white font-semibold text-lg">Contact Us</h3>
            <button
              onClick={() => {
                setShowChatbot(false);
                setChatSuccess(false);
                setChatError("");
              }}
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {chatSuccess ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.success }}
                >
                  <Send className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-semibold" style={{ color: theme.colors.success }}>
                  Message Sent!
                </p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage}>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    value={chatForm.subject}
                    onChange={(e) => setChatForm({ ...chatForm, subject: e.target.value })}
                    placeholder="Enter subject..."
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2"
                    style={{ borderColor: theme.colors.border }}
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    Message
                  </label>
                  <textarea
                    value={chatForm.message}
                    onChange={(e) => setChatForm({ ...chatForm, message: e.target.value })}
                    placeholder="Write your message..."
                    rows={4}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 resize-none"
                    style={{ borderColor: theme.colors.border }}
                  />
                </div>
                {chatError && (
                  <p className="text-sm mb-3" style={{ color: theme.colors.danger }}>
                    {chatError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
