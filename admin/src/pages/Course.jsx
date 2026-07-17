import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, X, Loader2, Search, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { theme } from "../theme";
import Pagination from "../components/Pagination";
import {
  createCourse,
  getAllCourses,
  editCourse,
  deleteCourse,
  updateCourseStatus,
  getAllSubjects,
  getAllClasses,
  createClass,
  createSubject,
  getSyllabus,
  addUpdateSyllabusFile,
  updateSyllabusBullets,
} from "../services/api";

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const COURSE_TYPES = ["academic", "non-academic"];
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German"];
const MAX_BULLETS = 10;
const BULLET_CHAR_LIMIT = 200;

export default function Course({ status = "Active" }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingLoading, setSavingLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseName: "",
    courseType: "",
    courseDescription: "",
    thumbnail: null,
    difficulty: "",
    mrp: "",
    discountedprice: "",
    courseStartDate: "",
    deadline: "",
    courseDuration: "",
    // Academic fields
    board: "",
    medium: "",
    classname: "",
    subject: "",
    stream: "",
    // Non-academic fields
    category: "",
    subcategory: "",
    targetAudience: "",
    totalLessons: "",
  });
  const [updatingId, setUpdatingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [fullScreenLoading, setFullScreenLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [subjects, setSubjects] = useState([]);

  // Class management state
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [showCustomClassInput, setShowCustomClassInput] = useState(false);
  const [customClassName, setCustomClassName] = useState("");
  const [customClassDescription, setCustomClassDescription] = useState("");

  // Subject management state
  const [showAddSubjectInput, setShowAddSubjectInput] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDescription, setNewSubjectDescription] = useState("");
  const [newSubjectLanguage, setNewSubjectLanguage] = useState("English");
  const [creatingClassLoading, setCreatingClassLoading] = useState(false);
  const [creatingSubjectLoading, setCreatingSubjectLoading] = useState(false);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [deadlineError, setDeadlineError] = useState("");

  // Syllabus states - Per-course cache + modal local
  const [courseSyllabusMap, setCourseSyllabusMap] = useState({});
  const [syllabusModalOpen, setSyllabusModalOpen] = useState(false);
  const [modalCourseCode, setModalCourseCode] = useState(null);
  const [modalSyllabus, setModalSyllabus] = useState({ syllabusPoints: [], syllabusUrl: "" });
  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentSyllabus, setCurrentSyllabus] = useState({ syllabusPoints: [], syllabusUrl: "" });
  const [tempBullets, setTempBullets] = useState("");
  const [savingSyllabus, setSavingSyllabus] = useState(false);
  const [localFilePreview, setLocalFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Helper to get syllabus for a course code
  const getCourseSyllabus = (courseCode) => {
    return courseSyllabusMap[courseCode] || { syllabusPoints: [], syllabusUrl: "" };
  };

  // Helper to update syllabus in map
  const updateCourseSyllabus = (courseCode, syllabusData) => {
    setCourseSyllabusMap(prev => ({
      ...prev,
      [courseCode]: syllabusData
    }));
  };

  // Calculate pagination
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const currentCourses = courses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [status, filterType, filterDifficulty]);

  useEffect(() => {
    fetchCourses();
  }, [searchTerm]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsResponse = await getAllSubjects();
        setSubjects(subjectsResponse.data || []);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await getAllClasses();
        setClasses(response.data || []);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // Pre-fetch syllabus for all courses when courses change
  useEffect(() => {
    if (courses.length > 0) {
      const loadAllSyllabusData = async () => {
        const courseCodes = [...new Set(courses.map(c => c.courseCode))];
        for (const courseCode of courseCodes) {
          try {
            const response = await getSyllabus(courseCode);
            const syllabusData = response.data || { syllabusPoints: [], syllabusUrl: "" };
            updateCourseSyllabus(courseCode, syllabusData);
          } catch (err) {
            console.error(`Failed to fetch syllabus for ${courseCode}:`, err);
            // Set empty to avoid stale cache
            updateCourseSyllabus(courseCode, { syllabusPoints: [], syllabusUrl: "" });
          }
        }
      };
      loadAllSyllabusData();
    }
  }, [courses]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (filterType) params.courseType = filterType;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      const response = await getAllCourses(params);
      let filteredCourses = response.data || [];

      // Client-side search filtering
      if (searchTerm) {
        filteredCourses = filteredCourses.filter(
          (course) =>
            course.courseName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            course.courseCode
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            course.courseDescription
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        );
      }

      setCourses(filteredCourses);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };
  const handleStartDateChange = (e) => {
    const startDate = e.target.value;
    let errors = { ...fieldErrors };

    // Validate if deadline exists and is smaller
    if (formData.deadline && startDate > formData.deadline) {
      errors.deadline = "Deadline cannot be earlier than start date";
    } else {
      delete errors.deadline;
    }

    setFormData({ ...formData, courseStartDate: startDate });
    setFieldErrors(errors);
  };
  const handleMrpChange = (e) => {
    const mrp = e.target.value;
    let errors = { ...fieldErrors };

    // If discounted price exists and is greater than new MRP
    if (
      formData.discountedprice &&
      Number(formData.discountedprice) > Number(mrp)
    ) {
      errors.discountedprice = "Discounted price cannot be greater than MRP";
    } else {
      delete errors.discountedprice;
    }

    setFormData({ ...formData, mrp });
    setFieldErrors(errors);
  };

  const handleDiscountedPriceChange = (e) => {
    const discountedprice = e.target.value;
    let errors = { ...fieldErrors };

    // Main validation: discounted price > MRP
    if (formData.mrp && Number(discountedprice) > Number(formData.mrp)) {
      errors.discountedprice = "Discounted price cannot be greater than MRP";
    } else {
      delete errors.discountedprice;
    }

    setFormData({
      ...formData,
      discountedprice,
    });
    setFieldErrors(errors);
  };

  const handleDeadlineChange = (e) => {
    const deadline = e.target.value;
    let errors = { ...fieldErrors };

    // Main validation: deadline < start date
    if (formData.courseStartDate && deadline < formData.courseStartDate) {
      errors.deadline = "Deadline cannot be earlier than start date";
    } else {
      delete errors.deadline;
    }

    setFormData({ ...formData, deadline });
    setFieldErrors(errors);
  };

  // FIX: Use classes from classes table instead of extracting from subjects
  const getDistinctClasses = () => {
    const uniqueClasses = [
      ...new Set(classes.map((cls) => cls.className).filter(Boolean)),
    ];
    return uniqueClasses.sort();
  };

  const getFilteredSubjects = () => {
    if (!formData.classname) return [];
    return subjects.filter(
      (subject) => subject.ForClass === formData.classname,
    );
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({
      courseName: "",
      courseType: "",
      courseDescription: "",
      thumbnail: null,
      difficulty: "",
      mrp: "",
      discountedprice: "",
      courseStartDate: "",
      deadline: "",
      courseDuration: "",
      // Academic fields
      board: "",
      medium: "",
      classname: "",
      subject: "",
      stream: "",
      // Non-academic fields
      category: "",
      subcategory: "",
      targetAudience: "",
      totalLessons: "",
    });
    setSelectedClass("");
    setShowCustomClassInput(false);
    setCustomClassName("");
    setCustomClassDescription("");
    setShowAddSubjectInput(false);
    setNewSubjectName("");
    setNewSubjectDescription("");
    setNewSubjectLanguage("English");
    setFieldErrors({});
    setIsPopupOpen(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      courseType: course.courseType,
      courseDescription: course.courseDescription || "",
      thumbnail: null, // Reset to null for file input
      difficulty: course.difficulty,
      mrp: course.mrp || "",
      discountedprice: course.discountedprice || "",
      courseStartDate: course.courseStartDate || "",
      deadline: course.deadline ? course.deadline.split("T")[0] : "",
      courseDuration: course.courseDuration || "",
      // Academic fields
      board: course.board || "",
      medium: course.medium || "",
      classname: course.classname || "",
      subject: course.subject || "",
      stream: course.stream || "",
      // Non-academic fields
      category: course.category || "",
      subcategory: course.subcategory || "",
      targetAudience: course.targetAudience || "",
      totalLessons: course.totalLessons || "",
    });
    setSelectedClass(course.classname || "");
    setShowCustomClassInput(false);
    setCustomClassName("");
    setCustomClassDescription("");
    setShowAddSubjectInput(false);
    setNewSubjectName("");
    setNewSubjectDescription("");
    setNewSubjectLanguage("English");
    setIsPopupOpen(true);
  };

  const handleDeleteCourse = async (courseCode) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setFullScreenLoading(true);
      try {
        await deleteCourse(courseCode);
        setCourses(courses.filter((c) => c.courseCode !== courseCode));
        toast.success("Course deleted successfully!");
      } catch (err) {
        console.error("Failed to delete course:", err);
        toast.error("Failed to delete course. Please try again.");
      } finally {
        setFullScreenLoading(false);
      }
    }
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.courseName) errors.courseName = true;
    if (!formData.courseType) errors.courseType = true;
    if (!formData.courseDescription) errors.courseDescription = true;
    if (!formData.difficulty) errors.difficulty = true;
    if (!formData.deadline) errors.deadline = true;
    if (!formData.courseDuration) errors.courseDuration = true;

    // Validation for academic courses
    if (formData.courseType === "academic") {
      if (!formData.classname) errors.classname = true;
      if (!formData.subject) errors.subject = true;
    }

    // Validation for non-academic courses
    if (formData.courseType === "non-academic") {
      if (!formData.category) errors.category = true;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill all required fields");
      return;
    }

    setFieldErrors({});

    setSavingLoading(true);
    setFullScreenLoading(true);
    try {
      if (editingCourse) {
        await editCourse(editingCourse.courseCode, formData);
        setCourses(
          courses.map((c) =>
            c.courseCode === editingCourse.courseCode
              ? { ...c, ...formData }
              : c,
          ),
        );
        toast.success("Course updated successfully!");
      } else {
        const response = await createCourse(formData);
        setCourses([response.data, ...courses]);
        toast.success("Course created successfully!");
      }
      setIsPopupOpen(false);
    } catch (err) {
      console.error("Failed to save course:", err);
      toast.error("Failed to save course. Please try again.");
    } finally {
      setSavingLoading(false);
      setFullScreenLoading(false);
    }
  };

  // Check if deadline is expired
  const isDeadlineExpired = (course) => {
    if (!course.deadline) return false;
    const deadlineDate = new Date(course.deadline);
    const currentDate = new Date();
    return deadlineDate < currentDate;
  };

  // Handle status change with confirmation
  const handleStatusChange = (course, newStatus) => {
    if (course.status === newStatus) {
      setOpenMenuId(null);
      return;
    }

    // If trying to activate an inactive course, check deadline
    if (newStatus === "Active" && isDeadlineExpired(course)) {
      setDeadlineError(
        "Please increase the deadline. This course has expired.",
      );
      setPendingStatusChange({ course, newStatus });
      setShowConfirmDialog(true);
      setOpenMenuId(null);
      return;
    }

    // Show confirmation dialog for normal cases
    setPendingStatusChange({ course, newStatus });
    setDeadlineError("");
    setShowConfirmDialog(true);
    setOpenMenuId(null);
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { course, newStatus } = pendingStatusChange;

    setShowConfirmDialog(false);
    setFullScreenLoading(true);
    try {
      setUpdatingId(course.courseCode);
      await updateCourseStatus(course.courseCode, newStatus);
      setCourses((prev) =>
        prev.map((c) =>
          c.courseCode === course.courseCode ? { ...c, status: newStatus } : c,
        ),
      );
      toast.success(`Course set to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
      setFullScreenLoading(false);
      setPendingStatusChange(null);
    }
  };

  // Cancel status change
  const cancelStatusChange = () => {
    setShowConfirmDialog(false);
    setPendingStatusChange(null);
    setDeadlineError("");
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingCourse(null);
    setFormData({
      courseName: "",
      courseType: "",
      courseDescription: "",
      thumbnailUrl: "",
      difficulty: "",
      mrp: "",
      discountedprice: "",
      courseStartDate: "",
      deadline: "",
      courseDuration: "",
      board: "",
      medium: "",
      classname: "",
      subject: "",
      stream: "",
      category: "",
      subcategory: "",
      targetAudience: "",
      totalLessons: "",
    });
    setSelectedClass("");
    setShowCustomClassInput(false);
    setCustomClassName("");
    setCustomClassDescription("");
    setShowAddSubjectInput(false);
    setNewSubjectName("");
    setNewSubjectDescription("");
    setNewSubjectLanguage("English");
  };

  const handleSearch = () => {
    fetchCourses();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500 hover:bg-green-600";
      case "Inactive":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler for class dropdown change
  const handleClassChange = (e) => {
    const value = e.target.value;
    setSelectedClass(value);
    if (value === "Other") {
      setShowCustomClassInput(true);
      setFormData({ ...formData, classname: "", subject: "" });
    } else {
      setShowCustomClassInput(false);
      setFormData({ ...formData, classname: value, subject: "" });
    }
    setShowAddSubjectInput(false);
    setNewSubjectName("");
    setNewSubjectDescription("");
    setNewSubjectLanguage("English");
  };

  // Handler for custom class input
  const handleCustomClassChange = (e) => {
    const value = e.target.value;
    setCustomClassName(value);
    setFormData({ ...formData, classname: value, subject: "" });
  };

  // Handler for custom class description
  const handleCustomClassDescriptionChange = (e) => {
    setCustomClassDescription(e.target.value);
  };

  // Handler for creating new class
  const handleCreateNewClass = async () => {
    if (!customClassName.trim()) {
      toast.error("Please enter a class name");
      return;
    }

    setCreatingClassLoading(true);
    try {
      // Use the description if provided, otherwise use default
      const classDescription =
        customClassDescription.trim() || `Class ${customClassName}`;

      const response = await createClass({
        className: customClassName,
        class_description: classDescription,
      });

      // Add the new class to the classes list
      setClasses([...classes, response.data]);

      // Set the form data with the new class
      setFormData({ ...formData, classname: customClassName, subject: "" });

      // Reset states
      setShowCustomClassInput(false);
      setSelectedClass(customClassName);
      setCustomClassName("");
      setCustomClassDescription("");

      toast.success("Class created successfully!");
    } catch (err) {
      console.error("Failed to create class:", err);
      toast.error("Failed to create class. Please try again.");
    } finally {
      setCreatingClassLoading(false);
    }
  };

  // Handler for subject dropdown change
  const handleSubjectChange = (e) => {
    const value = e.target.value;
    if (value === "AddNew") {
      setShowAddSubjectInput(true);
    } else {
      setShowAddSubjectInput(false);
      setFormData({ ...formData, subject: value });
    }
    setNewSubjectName("");
    setNewSubjectDescription("");
    setNewSubjectLanguage("English");
  };

  // Handler for custom subject input
  const handleNewSubjectChange = (e) => {
    setNewSubjectName(e.target.value);
  };

  // Handler for new subject description
  const handleNewSubjectDescriptionChange = (e) => {
    setNewSubjectDescription(e.target.value);
  };

  // Handler for new subject language
  const handleNewSubjectLanguageChange = (e) => {
    setNewSubjectLanguage(e.target.value);
  };

  // Handler for creating new subject
  const handleCreateNewSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error("Please enter a subject name");
      return;
    }

    if (!formData.classname) {
      toast.error("Please select or create a class first");
      return;
    }

    setCreatingSubjectLoading(true);
    try {
      const response = await createSubject({
        subjectName: newSubjectName,
        ForClass: formData.classname,
        description: newSubjectDescription.trim() || "",
        language: newSubjectLanguage,
      });

      // Add the new subject to the subjects list
      setSubjects([...subjects, response.data]);

      // Set the form data with the new subject
      setFormData({ ...formData, subject: newSubjectName });

      // Reset states
      setShowAddSubjectInput(false);
      setNewSubjectName("");
      setNewSubjectDescription("");
      setNewSubjectLanguage("English");

      toast.success("Subject created successfully!");
    } catch (err) {
      console.error("Failed to create subject:", err);
      toast.error("Failed to create subject. Please try again.");
    } finally {
      setCreatingSubjectLoading(false);
    }
  };
// Fix the handleUpdateSyllabusBullets function
const handleUpdateSyllabusBullets = async () => {
  // Filter out empty points
const bullets = (currentSyllabus.syllabusPoints || []).filter(p => p && p.trim());
  
  if (bullets.length === 0) {
    toast.error("Please add at least one syllabus point");
    return;
  }
  
  setSavingSyllabus(true);
  try {
    // Send update to backend
    await updateSyllabusBullets(currentCourse.courseCode, { syllabusPoints: bullets });
    
    // Fetch fresh data from backend after update
    const response = await getSyllabus(currentCourse.courseCode);
    const syllabusData = response.data || { syllabusPoints: [], syllabusUrl: "" };
    
    // Update all states with fresh data
    setCurrentSyllabus(syllabusData);
    updateCourseSyllabus(currentCourse.courseCode, syllabusData);
    setTempBullets(syllabusData.syllabusPoints.join('\n'));
    
    toast.success("Syllabus updated successfully!");
  } catch (err) {
    console.error("Failed to update syllabus:", err);
    toast.error("Failed to update syllabus");
  } finally {
    setSavingSyllabus(false);
  }
};
  // Fix the file upload handler
// Fix the file upload handler
const handleUpdateSyllabusFile = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Create preview URL for selected file
  const previewUrl = URL.createObjectURL(file);
  setLocalFilePreview(previewUrl);

  setSavingSyllabus(true);
  try {
    const formDataFile = new FormData();
    formDataFile.append("file", file);
    formDataFile.append("courseCode", currentCourse.courseCode);
    formDataFile.append("courseName", currentCourse.courseName);
    await addUpdateSyllabusFile(formDataFile);

    // Refresh syllabus to get new URL
    const response = await getSyllabus(currentCourse.courseCode);
    const syllabusData = response.data || { syllabusPoints: [], syllabusUrl: "" };

    // Update both current state and cache
    setCurrentSyllabus(syllabusData);
    updateCourseSyllabus(currentCourse.courseCode, syllabusData);

    // Update tempBullets with the refreshed data
    setTempBullets(syllabusData.syllabusPoints.join('\n'));

    toast.success("Syllabus file uploaded successfully!");
  } catch (err) {
    console.error("Failed to upload syllabus file:", err);
    toast.error("Failed to upload syllabus file");
  } finally {
    setSavingSyllabus(false);
    setLocalFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
};
// Fix the handleSyllabusEdit function to always fetch fresh data
const handleSyllabusEdit = async (course) => {
  setCurrentCourse(course);
  setModalCourseCode(course.courseCode);
  setSyllabusModalOpen(true);
  setSavingSyllabus(true);
  setLocalFilePreview(null);

  try {
    // Always fetch fresh data from backend - don't rely on cache
    const response = await getSyllabus(course.courseCode);
    // console.log('Fetched syllabus data:', response.data); // Debug log
    
    const syllabusData = response.data || { syllabusPoints: [], syllabusUrl: "" };
    
    // Update cache and state
    updateCourseSyllabus(course.courseCode, syllabusData);
    setCurrentSyllabus(syllabusData);
    setTempBullets(syllabusData.syllabusPoints.join('\n'));
  } catch (err) {
    console.error("Failed to fetch syllabus:", err);
    toast.error("Failed to fetch syllabus");
    const emptySyllabus = { syllabusPoints: [], syllabusUrl: "" };
    updateCourseSyllabus(course.courseCode, emptySyllabus);
    setCurrentSyllabus(emptySyllabus);
    setTempBullets('');
  } finally {
    setSavingSyllabus(false);
  }
};

  // Fix the close handler to properly reset state
  const handleCloseSyllabusModal = () => {
    setSyllabusModalOpen(false);
    setLocalFilePreview(null);
    setCurrentCourse(null);
    setCurrentSyllabus({ syllabusPoints: [], syllabusUrl: "" });
    setTempBullets("");
    setSavingSyllabus(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  return (
    <div
      className="p-2 sm:p-4"
      style={{ backgroundColor: theme.colors.secondary, minHeight: "100vh" }}
    >
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1
          className="text-lg sm:text-xl font-semibold"
          style={{ color: theme.colors.textPrimary }}
        >
          Courses
        </h1>
        <button
          onClick={handleAddCourse}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white rounded-md"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {/* Search and Filters */}
      <div
        className="p-3 sm:p-4 rounded-lg shadow-md mb-4 sm:mb-6"
        style={{ backgroundColor: theme.colors.card }}
      >
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-end">
          <div className="flex-1 min-w-0 sm:min-w-64">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.textPrimary }}
            >
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.card,
                  color: theme.colors.textPrimary,
                  focusRingColor: theme.colors.primary,
                }}
                placeholder="Search by name, code, or description..."
              />
              <Search
                className="absolute left-3 top-2.5 w-4 h-4"
                style={{ color: theme.colors.textSecondary }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 w-4 h-4 hover:opacity-80"
                  style={{ color: theme.colors.textSecondary }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status filter removed as it is now page-level */}

          <div className="w-full sm:w-auto">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.textPrimary }}
            >
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.card,
                color: theme.colors.textPrimary,
                focusRingColor: theme.colors.primary,
              }}
            >
              <option value="">All Types</option>
              <option value="academic">Academic</option>
              <option value="non-academic">Non-Academic</option>
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.textPrimary }}
            >
              Difficulty
            </label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.card,
                color: theme.colors.textPrimary,
                focusRingColor: theme.colors.primary,
              }}
            >
              <option value="">All Levels</option>
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-4 py-2 text-white rounded-md"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Courses Table */}
      {loading ? (
        <div
          className="text-center py-8 sm:py-10"
          style={{ color: theme.colors.textSecondary }}
        >
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div
          className="text-center py-8 sm:py-10"
          style={{ color: theme.colors.textSecondary }}
        >
          No courses found.
        </div>
      ) : (
        <div
          className="rounded-lg shadow-md overflow-hidden overflow-x-auto"
          style={{ backgroundColor: theme.colors.card }}
        >
          <table className="w-full min-w-full">
            <thead
              style={{
                backgroundColor: theme.colors.secondary,
                borderColor: theme.colors.border,
              }}
              className="border-b"
            >
              <tr>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Course Name
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Code
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Type
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Difficulty
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Price
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden xl:table-cell"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Total Enrollment
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden xl:table-cell"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Syllabus
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Status
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }}
              className="divide-y"
            >
              {currentCourses.map((course) => (
                <tr
                  key={course.courseCode}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(`/course/profile/${course.courseCode}`)
                  }
                >
                  <td className="px-6 py-4 max-w-[250px]">
                    <div
                      className="text-sm font-medium text-gray-900 truncate"
                      title={course.courseName}
                    >
                      {course.courseName}
                    </div>
                    {course.courseDescription && (
                      <div
                        className="text-sm text-gray-500 line-clamp-2"
                        title={course.courseDescription}
                      >
                        {course.courseDescription}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.courseCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.courseType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.difficulty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.discountedprice
                      ? `₹${course.discountedprice}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden xl:table-cell">
                    {course.totalenrollment || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden xl:table-cell">
  <div className="flex items-center gap-2">
    
    {getCourseSyllabus(course.courseCode).syllabusPoints &&
    getCourseSyllabus(course.courseCode).syllabusPoints.length > 0 ? (
      <button
        type="button"
        className="text-blue-600 hover:underline text-sm"
        onClick={(e) => {
          e.stopPropagation();
          handleViewSyllabus(course.courseCode);
        }}
      >
        View Syllabus
      </button>
    ) : (
      <span className="text-gray-500 text-sm">No syllabus</span>
    )}

    <button
      onClick={(e) => {
        e.stopPropagation();
        handleSyllabusEdit(course);
      }}
      className="p-1 hover:bg-gray-200 rounded-full"
      style={{ color: theme.colors.primary }}
      title="Edit syllabus"
    >
      <Pencil className="w-4 h-4" />
    </button>

  </div>
</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {course.status === "Active" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(course, "Inactive");
                          }}
                          disabled={updatingId === course.courseCode}
                          className="px-3 py-1 text-sm font-medium rounded text-white bg-green-500 hover:bg-green-600 transition-colors"
                        >
                          Active
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(course, "Active");
                          }}
                          disabled={updatingId === course.courseCode}
                          className="px-3 py-1 text-sm font-medium rounded text-white bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          Inactive
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCourse(course);
                        }}
                        className="hover:opacity-80"
                        style={{ color: theme.colors.primary }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.courseCode);
                        }}
                        className="hover:opacity-80"
                        style={{ color: theme.colors.danger }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4"
              style={{ borderBottom: `1px solid ${theme.colors.border}` }}
            >
              <h2
                className="text-base sm:text-lg font-semibold"
                style={{ color: theme.colors.textPrimary }}
              >
                {editingCourse ? "Edit Course" : "Add Course"}
              </h2>
              <button
                onClick={handleClosePopup}
                className="transition hover:opacity-80"
                style={{ color: theme.colors.textSecondary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) =>
                      setFormData({ ...formData, courseName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border ${fieldErrors.courseName ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Enter course name"
                  />
                  {fieldErrors.courseName && (
                    <p className="text-red-500 text-xs mt-1">
                      Please fill this field, this field is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Type *
                  </label>
                  <select
                    value={formData.courseType}
                    onChange={(e) =>
                      setFormData({ ...formData, courseType: e.target.value })
                    }
                    className={`w-full px-3 py-2 border ${fieldErrors.courseType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="">Select Type</option>
                    {COURSE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.courseType && (
                    <p className="text-red-500 text-xs mt-1">
                      Please fill this field, this field is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className={`w-full px-3 py-2 border ${fieldErrors.difficulty ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="">Select Difficulty</option>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.difficulty && (
                    <p className="text-red-500 text-xs mt-1">
                      Please fill this field, this field is required
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.mrp}
                    onChange={handleMrpChange}
                    className={`w-full px-3 py-2 border ${fieldErrors.mrp ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Enter MRP"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discounted Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.discountedprice}
                    onChange={handleDiscountedPriceChange}
                    className={`w-full px-3 py-2 border ${fieldErrors.discountedprice
                        ? "border-red-500"
                        : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Enter discounted price"
                    min="0"
                    max={formData.mrp || undefined} // prevents entering more than MRP
                    step="0.01"
                  />
                  {fieldErrors.discountedprice && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.discountedprice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.files[0] })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formData.thumbnail && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {formData.thumbnail.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Start Date*
                  </label>
                  <input
                    type="date"
                    value={formData.courseStartDate}
                    onChange={handleStartDateChange}
                    className={`w-full px-3 py-2 border ${fieldErrors.courseStartDate
                        ? "border-red-500"
                        : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {fieldErrors.courseStartDate && (
                    <p className="text-red-500 text-xs mt-1">
                      Please fill this field, this field is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline Of Course*
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={handleDeadlineChange}
                    min={formData.courseStartDate || ""}
                    className={`w-full px-3 py-2 border ${fieldErrors.deadline
                        ? "border-red-500"
                        : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {fieldErrors.deadline && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.deadline ||
                        "Please fill this field, this field is required"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Duration for student(in days)*
                  </label>
                  <input
                    type="number"
                    value={formData.courseDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        courseDuration: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border ${fieldErrors.courseDuration ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {fieldErrors.courseDuration && (
                    <p className="text-red-500 text-xs mt-1">
                      Please fill this field, this field is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Lessons
                  </label>
                  <input
                    type="number"
                    value={formData.totalLessons}
                    onChange={(e) =>
                      setFormData({ ...formData, totalLessons: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter total lessons"
                    min="0"
                  />
                </div>
              </div>

              {/* Academic Fields */}
              {formData.courseType === "academic" && (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                  style={{
                    borderTop: `1px solid ${theme.colors.border}`,
                    paddingTop: "1rem",
                  }}
                >
                  <h3
                    className="col-span-full text-sm sm:text-md font-medium"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    Academic Course Details
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Board *
                    </label>
                    <input
                      type="text"
                      value={formData.board}
                      onChange={(e) =>
                        setFormData({ ...formData, board: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter board"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medium
                    </label>
                    <input
                      type="text"
                      value={formData.medium}
                      onChange={(e) =>
                        setFormData({ ...formData, medium: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Level *
                    </label>
                    <select
                      value={selectedClass}
                      onChange={handleClassChange}
                      className={`w-full px-3 py-2 border ${fieldErrors.classname ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="">Select Class</option>
                      {getDistinctClasses().map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                      <option value="Other">+ Add New Class</option>
                    </select>
                    {showCustomClassInput && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customClassName}
                            onChange={handleCustomClassChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter new class name"
                          />
                          <button
                            type="button"
                            onClick={handleCreateNewClass}
                            disabled={creatingClassLoading}
                            className="px-3 py-2 text-white rounded-md disabled:opacity-50"
                            style={{ backgroundColor: theme.colors.success }}
                          >
                            {creatingClassLoading ? "Adding..." : "Add"}
                          </button>
                        </div>
                        {/* FIX: Add Description input for custom class */}
                        <input
                          type="text"
                          value={customClassDescription}
                          onChange={handleCustomClassDescriptionChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter class description (optional)"
                        />
                      </div>
                    )}
                    {fieldErrors.classname && (
                      <p className="text-red-500 text-xs mt-1">
                        Please fill this field, this field is required
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={handleSubjectChange}
                      className={`w-full px-3 py-2 border ${fieldErrors.subject ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="">Select Subject</option>
                      {getFilteredSubjects().map((subject) => (
                        <option
                          key={subject.subjectCode}
                          value={subject.subjectName}
                        >
                          {subject.subjectName}
                        </option>
                      ))}
                      {formData.classname && (
                        <option value="AddNew">+ Add New Subject</option>
                      )}
                    </select>
                    {showAddSubjectInput && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSubjectName}
                            onChange={handleNewSubjectChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter new subject name"
                          />
                          <button
                            type="button"
                            onClick={handleCreateNewSubject}
                            disabled={creatingSubjectLoading}
                            className="px-3 py-2 text-white rounded-md disabled:opacity-50"
                            style={{ backgroundColor: theme.colors.success }}
                          >
                            {creatingSubjectLoading ? "Adding..." : "Add"}
                          </button>
                        </div>
                        {/* FIX: Add Description input for new subject */}
                        <input
                          type="text"
                          value={newSubjectDescription}
                          onChange={handleNewSubjectDescriptionChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter subject description (optional)"
                        />
                        {/* FIX: Add Language dropdown for new subject */}
                        <select
                          value={newSubjectLanguage}
                          onChange={handleNewSubjectLanguageChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Language</option>
                          {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {fieldErrors.subject && (
                      <p className="text-red-500 text-xs mt-1">
                        Please fill this field, this field is required
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stream
                    </label>
                    <input
                      type="text"
                      value={formData.stream}
                      onChange={(e) =>
                        setFormData({ ...formData, stream: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter stream"
                    />
                  </div>
                </div>
              )}

              {/* Non-Academic Fields */}
              {formData.courseType === "non-academic" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <h3 className="col-span-full text-md font-medium text-gray-800">
                    Non-Academic Course Details
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className={`w-full px-3 py-2 border ${fieldErrors.category ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Enter category"
                    />
                    {fieldErrors.category && (
                      <p className="text-red-500 text-xs mt-1">
                        Please fill this field, this field is required
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subcategory: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter subcategory"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetAudience: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter target audience"
                    />
                  </div>
                </div>
              )}

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Description *
                </label>
                <textarea
                  value={formData.courseDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courseDescription: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border ${fieldErrors.courseDescription ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Enter course description"
                  rows="4"
                />
                {fieldErrors.courseDescription && (
                  <p className="text-red-500 text-xs mt-1">
                    Please fill this field, this field is required
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4"
              style={{ borderTop: `1px solid ${theme.colors.border}` }}
            >
              <button
                onClick={handleClosePopup}
                className="px-3 sm:px-4 py-2 rounded-md transition"
                style={{
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: "transparent",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={savingLoading}
                className="px-3 sm:px-4 py-2 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {savingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {savingLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Loading Overlay */}
      {fullScreenLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-gray-700">Processing...</span>
          </div>
        </div>
      )}

{/* Syllabus Modal */}
{syllabusModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div
      className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
      style={{ border: `1px solid ${theme.colors.border}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
        <h3 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
          Syllabus - {currentCourse?.courseName || modalCourseCode}
        </h3>
        <button
          onClick={handleCloseSyllabusModal}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* PDF File */}
        <div className="border-t pt-4" style={{ borderColor: theme.colors.border }}>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
            Syllabus file (PDF)
          </label>
          
          <div className="flex items-center gap-3">
            {localFilePreview ? (
              <span className="text-sm text-green-600 flex-1 truncate">
                {fileInputRef.current?.files[0]?.name}
              </span>
            ) : currentSyllabus.syllabusUrl ? (
              <a
                href={currentSyllabus.syllabusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex-1 truncate"
              >
                View PDF
              </a>
            ) : (
              <span className="text-sm text-gray-400 flex-1">No PDF uploaded</span>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleUpdateSyllabusFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={savingSyllabus}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingSyllabus ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
        {/* Syllabus Points */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
            Bullet Points 
          </label>
          
          {/* Points Container with Scroll */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {currentSyllabus.syllabusPoints && currentSyllabus.syllabusPoints.length > 0 ? (
              currentSyllabus.syllabusPoints.slice(0, 4).map((point, index) => (
                <div key={index} className="flex gap-2 items-start">

                  <div className="flex-shrink-0 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2"></div>
                  </div>
                  <textarea
                    value={point}
                    onChange={(e) => {
                      const updatedPoints = [...currentSyllabus.syllabusPoints];
                      updatedPoints[index] = e.target.value;
                      setCurrentSyllabus({ ...currentSyllabus, syllabusPoints: updatedPoints });
                      setTempBullets(updatedPoints.join('\n'));
                    }}
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                    rows="2"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.card,
                      color: theme.colors.textPrimary,
                      fontSize: '14px'
                    }}
                    placeholder={`Point ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const updatedPoints = (currentSyllabus.syllabusPoints || []).filter((_, i) => i !== index);

                      setCurrentSyllabus({ ...currentSyllabus, syllabusPoints: updatedPoints });
                      setTempBullets(updatedPoints.join('\n'));
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                No syllabus points added
              </div>
            )}
          </div>
          
          {/* Add Button */}
          <button
            onClick={() => {
              const updatedPoints = [...(currentSyllabus.syllabusPoints || []), ""];
              setCurrentSyllabus({ ...currentSyllabus, syllabusPoints: updatedPoints });
              setTempBullets(updatedPoints.join('\n'));
            }}
            className="mt-3 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-3 h-3" />
            Add Point
          </button>
        </div>

        
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 p-4 border-t" style={{ borderColor: theme.colors.border }}>
        <button
          onClick={handleCloseSyllabusModal}
          className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateSyllabusBullets}
          disabled={savingSyllabus}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
        >
          {savingSyllabus && <Loader2 className="w-3 h-3 animate-spin" />}
          Save
        </button>
      </div>
    </div>
  </div>
)}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            style={{ animation: "modalSlideIn 0.2s ease-out" }}
          >
            {/* Dialog Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {pendingStatusChange?.newStatus === "Active"
                    ? "Activate Course"
                    : "Inactivate Course"}
                </h3>
              </div>
            </div>

            {/* Dialog Body */}
            <div className="px-6 py-5">
              {deadlineError ? (
                <div className="space-y-3">
                  <p className="text-gray-700 text-base">
                    Do you want to activate this course?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-red-800 font-medium text-sm">
                          Deadline Expired
                        </p>
                        <p className="text-red-600 text-sm mt-1">
                          {deadlineError}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Please edit the course and increase the deadline to activate
                    it.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-700 text-base">
                    {pendingStatusChange?.newStatus === "Active"
                      ? `Are you sure you want to activate "${pendingStatusChange?.course?.courseName}"?`
                      : `Are you sure you want to inactivate "${pendingStatusChange?.course?.courseName}"?`}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Current Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${pendingStatusChange?.course?.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {pendingStatusChange?.course?.status}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">New Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${pendingStatusChange?.newStatus === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {pendingStatusChange?.newStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={cancelStatusChange}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              {deadlineError ? (
                <button
                  onClick={cancelStatusChange}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  OK, I'll Edit Deadline
                </button>
              ) : (
                <button
                  onClick={confirmStatusChange}
                  className={`px-4 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 ${pendingStatusChange?.newStatus === "Active"
                      ? "bg-green-600 hover:bg-green-700 focus:ring-green-300"
                      : "bg-red-600 hover:bg-red-700 focus:ring-red-300"
                    }`}
                >
                  {pendingStatusChange?.newStatus === "Active"
                    ? "Activate"
                    : "Inactivate"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
