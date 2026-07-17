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
} from "lucide-react";
import { theme } from "../theme";
import {
  LineChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  getDashboardStats,
  addBanner,
  getBanners,
  deleteBanner,
  BACKEND_BASE_URL,
} from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [approvedStudentCount, setApprovedStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [parentCount, setParentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [approvedEnrollmentCount, setApprovedEnrollmentCount] = useState(0);
  const [passoutEnrollmentCount, setPassoutEnrollmentCount] = useState(0);
  const [enrollmentCountThisMonth, setEnrollmentCountThisMonth] = useState(0);
  const [enrollmentCountThisWeek, setEnrollmentCountThisWeek] = useState(0);
  const [enrollmentDataThisWeek, setEnrollmentDataThisWeek] = useState([]);
  const [enrollmentDataThisMonth, setEnrollmentDataThisMonth] = useState([]);
  const [salesDataThisWeek, setSalesDataThisWeek] = useState([]);
  const [salesDataThisMonth, setSalesDataThisMonth] = useState([]);
  const [totalSalesThisMonth, setTotalSalesThisMonth] = useState(0);
  const [totalSalesThisWeek, setTotalSalesThisWeek] = useState(0);

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

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await getDashboardStats();
        if (response.success && response.data) {
          const { counts, charts } = response.data;
          
          setStudentCount(counts.student);
          setApprovedStudentCount(counts.approvedStudent);
          setTeacherCount(counts.teacher);
          setParentCount(counts.parent);
          setCourseCount(counts.course);
          
          setEnrollmentCount(counts.enrollment.total);
          setApprovedEnrollmentCount(counts.enrollment.approved);
          setPassoutEnrollmentCount(counts.enrollment.passout);
          setEnrollmentCountThisMonth(counts.enrollment.month);
          setEnrollmentCountThisWeek(counts.enrollment.week);
          
          setTotalSalesThisMonth(counts.sales.month);
          setTotalSalesThisWeek(counts.sales.week);
          
          setEnrollmentDataThisWeek(charts.enrollmentThisWeek);
          setEnrollmentDataThisMonth(charts.enrollmentThisMonth);
          setSalesDataThisWeek(charts.salesThisWeek);
          setSalesDataThisMonth(charts.salesThisMonth);
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

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

  // Handle banner form submission
  const handleAddBanner = async (e) => {
    e.preventDefault();
    try {
      const response = await addBanner(bannerForm);
      if (response.success) {
        setBanners([...banners, response.data]);
        setBannerForm({
          title: "",
          description: "",
          status: "active",
          image: null,
        });
        setShowBannerForm(false);
      }
    } catch (error) {
      console.error("Error adding banner:", error);
    }
  };

  // Handle banner deletion
  const handleDeleteBanner = async (bannerId) => {
    try {
      const response = await deleteBanner(bannerId);
      if (response.success) {
        setBanners(banners.filter((banner) => banner.id !== bannerId));
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setBannerForm({ ...bannerForm, image: files[0] });
    } else {
      setBannerForm({ ...bannerForm, [name]: value });
    }
  };

  // Handle banner navigation
  const nextBanner = () => {
    setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex(
      (prevIndex) => (prevIndex - 1 + banners.length) % banners.length,
    );
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
                🚀 No banners available. Hover to add your first banner!
              </p>

              {/* Hover Add Banner */}
              <div className="opacity-100 mt-4">
                <button
                  onClick={() => setShowBannerForm(true)}
                  className="px-6 py-2 rounded-xl text-white font-semibold shadow hover:scale-105 transition"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, #6366f1)`,
                  }}
                >
                  + Add Banner
                </button>
              </div>
            </div>
          ) : (
            <>
              {banners[currentBannerIndex] && (
                <div className="relative w-full overflow-hidden rounded-2xl shadow-xl">
                  {/* Full Width Image */}
                  {banners[currentBannerIndex].image && (
                    <img
                      src={
                        banners[currentBannerIndex].image?.startsWith("http")
                          ? banners[currentBannerIndex].image
                          : `${BACKEND_BASE_URL}${banners[currentBannerIndex].image}`
                      }
                      alt={banners[currentBannerIndex].title}
                      className="w-full h-40 sm:h-52 md:h-64 lg:h-72 xl:h-80 2xl:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Hover Overlay (Admin Dashboard + Add Banner) */}
                  <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 sm:p-6">
                    {/* Top Section - Admin Dashboard + Actions */}
                    <div className="flex items-start justify-between">
                      <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-wide">
                        🎓 Admin Dashboard
                      </h2>

                      <div className="flex gap-2">
                        {/* Add Banner Button (Hover Only) */}
                        <button
                          onClick={() => setShowBannerForm(true)}
                          className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-lg hover:scale-105 transition"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.primary}, #6366f1)`,
                          }}
                        >
                          + Add Banner
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            handleDeleteBanner(banners[currentBannerIndex].id)
                          }
                          className="p-2 rounded-full shadow-lg hover:scale-110 transition"
                          style={{ backgroundColor: theme.colors.danger }}
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Text Content */}
                    <div className="text-white">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                        {banners[currentBannerIndex].title}
                      </h3>
                      <p className="text-sm sm:text-base opacity-90 max-w-2xl">
                        {banners[currentBannerIndex].description}
                      </p>
                    </div>
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

        {/* Banner Form (Keep Below) */}
        {showBannerForm && (
          <form
            onSubmit={handleAddBanner}
            className="mt-6 p-4 sm:p-6 rounded-2xl shadow-lg border bg-white"
            style={{ borderColor: theme.colors.border }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="title"
                placeholder="Enter Banner Title"
                value={bannerForm.title}
                onChange={handleFormChange}
                className="p-3 border rounded-xl outline-none focus:ring-2 w-full"
                style={{ borderColor: theme.colors.border }}
                required
              />

              <input
                type="file"
                name="image"
                onChange={handleFormChange}
                className="p-3 border rounded-xl cursor-pointer w-full"
                style={{ borderColor: theme.colors.border }}
                accept="image/*"
              />
            </div>

            <textarea
              name="description"
              placeholder="Write banner description..."
              value={bannerForm.description}
              onChange={handleFormChange}
              className="w-full p-3 border rounded-xl mt-4 outline-none focus:ring-2"
              style={{ borderColor: theme.colors.border }}
              rows="3"
            />

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="px-6 py-2 text-white rounded-xl shadow hover:scale-105 transition"
                style={{ backgroundColor: theme.colors.success }}
              >
                Save Banner
              </button>

              <button
                type="button"
                onClick={() => setShowBannerForm(false)}
                className="px-6 py-2 text-white rounded-xl shadow hover:opacity-90 transition"
                style={{ backgroundColor: theme.colors.textSecondary }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      {/* New Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard
          title="Total Students"
          value={studentCount.toString()}
          positive={true}
          onClick={() => navigate("/students")}
        />
        <StatCard
          title="Approved Students"
          value={approvedStudentCount.toString()}
          positive={true}
          onClick={() => navigate("/students")}
        />
        <StatCard
          title="Total Teachers"
          value={teacherCount.toString()}
          positive={true}
          onClick={() => navigate("/teacher")}
        />
        <StatCard
          title="Total Parents"
          value={parentCount.toString()}
          positive={true}
          onClick={() => navigate("/parents")}
        />
        <StatCard
          title="Total Course"
          value={courseCount.toString()}
          positive={true}
          onClick={() => navigate("/course")}
        />
        <StatCard
          title="Total Enrollments"
          value={enrollmentCount.toString()}
          positive={true}
          onClick={() => navigate("/enrollment")}
        />
        <StatCard
          title="Approved Enrollments"
          value={approvedEnrollmentCount.toString()}
          positive={true}
          onClick={() => navigate("/enrollment?status=APPROVED")}
        />
        <StatCard
          title="PassOut Enrollments"
          value={passoutEnrollmentCount.toString()}
          positive={true}
          onClick={() => navigate("/enrollment?status=PASSOUT")}
        />
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {/* LEFT SECTION */}
        <div className="space-y-6">
          {/* Students Enrolment */}
          <div
            className="rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            style={{
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Students Enrolment
                </h3>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.textSecondary }}
                >
                  In last 30 days enrolment of students
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 mb-4">
              <div className="text-center">
                <p
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: theme.colors.primary }}
                >
                  {enrollmentCountThisMonth}
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.textSecondary }}
                >
                  This Month
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: theme.colors.success }}
                >
                  {enrollmentCountThisWeek}
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.textSecondary }}
                >
                  This Week
                </p>
              </div>
            </div>

            {/* Enrollment Graph */}
            <ResponsiveContainer width="100%" height={128}>
              <LineChart data={enrollmentDataThisMonth}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.colors.border}
                />
                <XAxis dataKey="day" stroke={theme.colors.textSecondary} />
                <YAxis stroke={theme.colors.textSecondary} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke={theme.colors.success}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="rounded-xl p-4 sm:p-6 shadow-sm"
              style={{
                backgroundColor: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <h3
                className="font-semibold mb-2"
                style={{ color: theme.colors.textPrimary }}
              >
                Total Sales
              </h3>
              <p
                className="text-xs mb-4"
                style={{ color: theme.colors.textSecondary }}
              >
                vs. last month
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 mb-4">
                <div className="text-center">
                  <p
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: theme.colors.primary }}
                  >
                    ₹{totalSalesThisMonth}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    This Month
                  </p>
                </div>
                <div className="text-center">
                  <p
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: theme.colors.success }}
                  >
                    ₹{totalSalesThisWeek}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    This Week
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={128}>
                <BarChart data={salesDataThisMonth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.colors.border}
                  />
                  <XAxis dataKey="day" stroke={theme.colors.textSecondary} />
                  <YAxis stroke={theme.colors.textSecondary} />
                  <Tooltip />
                  <Bar dataKey="sales" fill={theme.colors.success} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              className="rounded-xl p-4 sm:p-6 shadow-sm"
              style={{
                backgroundColor: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <h3
                className="font-semibold mb-2"
                style={{ color: theme.colors.textPrimary }}
              >
                This Week So Far
              </h3>
              <p
                className="text-xs mb-4"
                style={{ color: theme.colors.textSecondary }}
              >
                vs. last week
              </p>
              <ResponsiveContainer width="100%" height={128}>
                <LineChart data={enrollmentDataThisWeek}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.colors.border}
                  />
                  <XAxis dataKey="day" stroke={theme.colors.textSecondary} />
                  <YAxis stroke={theme.colors.textSecondary} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke={theme.colors.primary}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
