"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  CreditCard,
  LogOut,
  Save,
  Sun,
  Moon,
  Monitor,
  Check,
  Edit2,
  X,
  Camera,
  FileText,
  Info,
  Shield,
  Smartphone,
  Mail,
  Download,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Footer } from "@/components/layout/Footer";
import { EDITPROFILE, GETPROFILE, API_AUTH_BASE, GETCONTENT, ENROLLMENT_PATHS } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

type Theme = "light" | "dark" | "system";

interface StudentData {
  name: string;
  email: string;
  mobile: string;
  studentId: string;
  profileImage: string;
  parentName: string;
  parentEmail: string;
  parentMobile: string;
  role: string;
  address: string;
  lattitude: string | null;
  longitude: string;
  Devicetype: string | null;
  otpVerified: boolean;
  country: string;
  status: string;
  parentId: string;
}

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedTheme, setSelectedTheme] = useState<Theme>("light");
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [contentData, setContentData] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactList, setContactList] = useState<any[]>([]);

  // Enrollment state
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [studentData, setStudentData] = useState<StudentData>({
    name: "",
    email: "",
    mobile: "",
    studentId: "",
    profileImage: "",
    parentName: "",
    parentEmail: "",
    parentMobile: "",
    role: "",
    address: "",
    lattitude: null,
    longitude: "",
    Devicetype: null,
    otpVerified: false,
    country: "",
    status: "",
    parentId: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    country: "",
    lattitude: "",
    longitude: "",
    profileImage: null as File | null,
  });
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const themeOptions = [
    {
      id: "light" as Theme,
      label: "Light",
      icon: Sun,
      description: "Clean and bright",
      preview: "bg-white border-gray-200",
    },
    {
      id: "dark" as Theme,
      label: "Dark",
      icon: Moon,
      description: "Easy on the eyes",
      preview: "bg-gray-900 border-gray-700",
    },
    {
      id: "system" as Theme,
      label: "System",
      icon: Monitor,
      description: "Match your device",
      preview: "bg-gradient-to-br from-white to-gray-900 border-gray-400",
    },
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const studentId =
    user?.studentId ||
    (typeof window !== "undefined" && localStorage.getItem("studentId")) ||
    "";

  // ================= FETCH PROFILE =================
  useEffect(() => {
    if (studentId) {
      fetchStudentProfile(studentId);
    }
  }, [studentId]);

  const fetchStudentProfile = async (studentId: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_AUTH_BASE}${GETPROFILE.getprofile(studentId)}`,
      );

      if (response.data.status) {
        const data = response.data.data;
        setStudentData(data);

        // Update auth store with profile data for navbar sync
        const auth = useAuth.getState();
        if (auth.user) {
          auth.login({
            name: data.name,
            email: data.email,
            studentId: data.studentId,
            country: data.country,
            profileImage: data.profileImage,
          });
        }

        // Initialize edit form with current data
        setEditFormData({
          name: data.name || "",
          address: data.address || "",
          country: data.country || "",
          lattitude: data.lattitude || "",
          longitude: data.longitude || "",
          profileImage: null,
        });
      }
    } catch (err) {
      setError("Failed to fetch profile data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchContentData();
  }, []);
  const submitContactForm = async () => {
  try {
    setContactLoading(true);
    setContactSuccess("");

    const token =
      typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;

    if (!token) {
      alert("Please login again");
      return;
    }

    // Basic validation
    if (!contactForm.subject || !contactForm.message) {
      alert("Subject and Message are required");
      return;
    }

    const url = `${API_AUTH_BASE}/api/contactus`;

    

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: studentData?.name,
        email: studentData?.email,
        phone: studentData?.mobile,
        role: "student",
        specificId: studentData?.studentId,
        subject: contactForm.subject,
        message: contactForm.message,
      }),
    });

    const data = await response.json();

    // console.log("Contact API Response:", data);

    if (!response.ok) {
      alert(`Error ${response.status}: ${data.message || "Failed to send"}`);
      return;
    }

    if (data.status) {
      setContactSuccess("Message sent successfully ✅");

      setContactList((prev) => [
        {
          ...contactForm,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setContactForm({ subject: "", message: "" });
    } else {
      alert(data.message || "Backend rejected the request");
    }
  } catch (error) {
    console.error("Contact Error:", error);
    alert("Unexpected error occurred");
  } finally {
    setContactLoading(false);
  }
};

  // Fetch Content from API
  const fetchContentData = async () => {
    try {
      setContentLoading(true);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;

      const url = `${API_AUTH_BASE}${GETCONTENT.getcontent}`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - Please login again");
        } else {
          console.error("Failed to load content");
        }
        setContentData([]);
        return;
      }

      const data = await response.json();

      if (data.status && data.data) {
        setContentData(data.data);
      } else {
        setContentData([]);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
      setContentData([]);
    } finally {
      setContentLoading(false);
    }
  };

  // ================= FETCH ENROLLMENTS =================
  const fetchEnrollments = async () => {
    if (!studentId) return;
    
    try {
      setEnrollmentLoading(true);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_AUTH_BASE}${ENROLLMENT_PATHS.getEnrollmentsByStudent(studentId)}`,
        { headers }
      );

      const data = await response.json();

      if (data.success) {
        setEnrollments(data.data || []);
      } else {
        setEnrollments([]);
      }
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
      setEnrollments([]);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // ================= HELPER: GET CONTENT BY KEY =================
  const getContentByKey = (key: string) => {
    if (!contentData || contentData.length === 0) return null;

    return contentData.find(
      (item) => item.key?.toLowerCase() === key.toLowerCase(),
    );
  };

  // ================= OPEN EDIT POPUP =================
  const openEditPopup = () => {
    setEditFormData({
      name: studentData.name || "",
      address: studentData.address || "",
      country: studentData.country || "",
      lattitude: studentData.lattitude || "",
      longitude: studentData.longitude || "",
      profileImage: null,
    });
    setPreviewImage(
      studentData.profileImage
        ? (studentData.profileImage.startsWith("http") ? studentData.profileImage : `${API_AUTH_BASE}${studentData.profileImage}`)
        : null,
    );
    setIsEditPopupOpen(true);
  };

  // ================= HANDLE IMAGE CHANGE =================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFormData({ ...editFormData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ================= UPDATE PROFILE =================
  const updateStudentProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("name", editFormData.name);
      formData.append("address", editFormData.address);
      formData.append("country", editFormData.country);
      formData.append("lattitude", editFormData.lattitude);
      formData.append("longitude", editFormData.longitude);

      if (editFormData.profileImage) {
        formData.append("profileImage", editFormData.profileImage);
      }

      const response = await axios.put(
        `${API_AUTH_BASE}${EDITPROFILE.editprofile(studentData.studentId)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.status) {
        // Refresh profile data
        await fetchStudentProfile(studentData.studentId);
        
        // Update auth store with new profile data for navbar sync
        const auth = useAuth.getState();
        if (auth.user) {
          auth.login({
            name: studentData.name,
            email: studentData.email,
            studentId: studentData.studentId,
            country: studentData.country,
            profileImage: studentData.profileImage,
          });
        }
        window.dispatchEvent(new Event("profileUpdated"));
        
        setIsEditPopupOpen(false);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrollments when switching to enrollment tab
  useEffect(() => {
    if (activeTab === "enrollment" && studentId) {
      fetchEnrollments();
    }
  }, [activeTab, studentId]);

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage your personal information and account details",
    },
    {
      id: "enrollment",
      label: "My Enrollment",
      icon: CreditCard,
      description: "View subscriptions, courses, and payment history",
    },
    {
      id: "terms",
      label: "Terms & Conditions",
      icon: FileText,
      description: "Read platform terms and usage guidelines",
    },
    {
      id: "aboutus",
      label: "About Us",
      icon: Info,
      description: "Learn more about our platform and mission",
    },
    {
      id: "privacypolicy",
      label: "Privacy Policy",
      icon: Shield,
      description: "Understand how we collect and protect your data",
    },
    {
      id: "android_url",
      label: "Android App URL",
      icon: Smartphone,
      description: "Download or access the Android application",
    },
    {
      id: "contact",
      label: "Contact Us",
      icon: Mail,
      description: "Get in touch with our support team",
    },
  ];

  return (
    <div className="space-y-6">
      {!isAuthenticated ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <User className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Please Register First
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              You need to create an account to access settings. Sign up for free to get started!
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/auth/login")}
              >
                Log In
              </Button>
              <Button
                onClick={() => router.push("/auth/signup")}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Up Free
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
      <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all group ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{tab.label}</div>
                        <div className="text-xs mt-0.5 text-gray-500">
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === "profile" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your personal details</CardDescription>
                </div>
                <Button
                  onClick={openEditPopup}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <div className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden">
                        {studentData.profileImage ? (
                          <img
                            src={studentData.profileImage.startsWith("http") ? studentData.profileImage : `${API_AUTH_BASE}${studentData.profileImage}`}
                            alt={studentData.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-bold">
                            {studentData.name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {studentData.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {studentData.email}
                        </p>
                      </div>
                    </div>

                    {/* Student Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Student ID
                        </label>
                        <p className="text-gray-900">{studentData.studentId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Mobile
                        </label>
                        <p className="text-gray-900">{studentData.mobile}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Role
                        </label>
                        <p className="text-gray-900 capitalize">
                          {studentData.role}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Status
                        </label>
                        <Badge
                          className={
                            studentData.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {studentData.status}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Address
                        </label>
                        <p className="text-gray-900">
                          {studentData.address || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Country
                        </label>
                        <p className="text-gray-900">
                          {studentData.country || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Parent Information */}
                    <div className="border-t pt-4">
                      <h3 className="text-md font-semibold mb-3">
                        Parent Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Parent Name
                          </label>
                          <p className="text-gray-900">
                            {studentData.parentName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Parent Email
                          </label>
                          <p className="text-gray-900">
                            {studentData.parentEmail}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Parent Mobile
                          </label>
                          <p className="text-gray-900">
                            {studentData.parentMobile}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Parent ID
                          </label>
                          <p className="text-gray-900">
                            {studentData.parentId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {activeTab === "enrollment" && (
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                  View your course enrollments and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrollmentLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading enrollments...</p>
                  </div>
                ) : enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No enrollments found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Enrollment Code</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Course Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Assigned Teacher</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Expiry Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((enrollment: any) => (
                          <tr key={enrollment.enrollmentCode} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{enrollment.enrollmentCode}</td>
                            <td className="py-3 px-4">{enrollment.courseName}</td>
                            <td className="py-3 px-4">{enrollment.teacherId || "Not Assigned"}</td>
                            <td className="py-3 px-4">
                              {enrollment.enrollmentExpireDate 
                                ? new Date(enrollment.enrollmentExpireDate).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={enrollment.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                {enrollment.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                {enrollment.pdfUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(enrollment.pdfUrl, '_blank')}
                                    title="Download Invoice"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEnrollment(enrollment);
                                    setIsViewDialogOpen(true);
                                  }}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {activeTab === "terms" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {getContentByKey("terms")?.title || "Terms & Conditions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <p>Loading...</p>
                ) : (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: getContentByKey("terms")?.description || "",
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}
          {activeTab === "aboutus" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {getContentByKey("aboutus")?.title || "About Us"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <p>Loading...</p>
                ) : (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: getContentByKey("aboutus")?.description || "",
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}
          {activeTab === "privacypolicy" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {getContentByKey("privacy")?.title || "Privacy Policy"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <p>Loading...</p>
                ) : (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: getContentByKey("privacy")?.description || "",
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}
          {activeTab === "android_url" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {getContentByKey("android_url")?.title || "Android App"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <p>Loading...</p>
                ) : (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: getContentByKey("android_url")?.description || "",
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}
          {activeTab === "contact" &&
            (() => {
              const contactContent = getContentByKey("contact");
              const cleanDescription =
                contactContent?.description
                  ?.replace(/<svg[\s\S]*?<\/svg>/g, "") // remove all SVG icons
                  ?.replace(/\/cdn\/assets\/sprites-core-[^"]+/g, "") || "";

              return (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {contactContent?.title || "Contact Us"}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-8">
                    {/* ================= CONTACT FORM ================= */}
                    <div className="border rounded-xl p-6 bg-gray-50 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Send us a Message
                      </h3>

                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input value={studentData.name} readOnly />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input value={studentData.email} readOnly />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input value={studentData.mobile} readOnly />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                          value={contactForm.subject}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              subject: e.target.value,
                            })
                          }
                          placeholder="Enter subject"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Message</label>
                        <textarea
                          className="w-full border rounded-md p-3 focus:ring-2 focus:ring-indigo-500"
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              message: e.target.value,
                            })
                          }
                          placeholder="Write your message..."
                        />
                      </div>

                      <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={submitContactForm}
                        disabled={contactLoading}
                      >
                        {contactLoading ? "Sending..." : "Send Message"}
                      </Button>
                    </div>

                    {/* ================= CONTACT DETAILS FROM CMS ================= */}
                    {!contentLoading && cleanDescription && (
                      <div className="border rounded-xl p-6 bg-white shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                          Contact Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                          {/* Email */}
                          <div className="flex items-start gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                              <Mail className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium">Email</p>
                              <div
                                className="text-sm text-gray-600"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    cleanDescription.match(
                                      /Email:.*?<br|Email:.*?<\/a>/,
                                    )?.[0] || "",
                                }}
                              />
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Smartphone className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Phone</p>
                              <div
                                className="text-sm text-gray-600"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    cleanDescription.match(
                                      /📞 Phone:.*?<br/,
                                    )?.[0] || "",
                                }}
                              />
                            </div>
                          </div>

                          {/* Website */}
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Globe className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Website</p>
                              <div
                                className="text-sm text-gray-600"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    cleanDescription.match(
                                      /Website:.*?<br|Website:.*?<\/a>/,
                                    )?.[0] || "",
                                }}
                              />
                            </div>
                          </div>

                          {/* Address */}
                          <div className="flex items-start gap-3">
                            <div className="bg-red-100 p-2 rounded-lg">
                              <Info className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">Address</p>
                              <div
                                className="text-sm text-gray-600"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    cleanDescription.match(
                                      /📍 Address:.*$/,
                                    )?.[0] || "",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
        </div>
      </div>

      {/* Edit Profile Popup */}
      <Dialog open={isEditPopupOpen} onOpenChange={setIsEditPopupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Profile Image Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-3xl font-bold">
                      {editFormData.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 cursor-pointer hover:bg-indigo-700"
                >
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <Input
                value={editFormData.country}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, country: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <Input
                value={editFormData.lattitude}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    lattitude: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Longitude
              </label>
              <Input
                value={editFormData.longitude}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    longitude: e.target.value,
                  })
                }
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsEditPopupOpen(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={updateStudentProfile}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Enrollment Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enrollment Details</DialogTitle>
          </DialogHeader>

          {selectedEnrollment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Enrollment Code</label>
                  <p className="text-gray-900 font-medium">{selectedEnrollment.enrollmentCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p>
                    <Badge className={selectedEnrollment.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {selectedEnrollment.status}
                    </Badge>
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Course Name</label>
                  <p className="text-gray-900">{selectedEnrollment.courseName}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Course Code</label>
                  <p className="text-gray-900">{selectedEnrollment.courseCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Course Price</label>
                  <p className="text-gray-900">₹{selectedEnrollment.coursePrice}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount Paid</label>
                  <p className="text-gray-900">₹{selectedEnrollment.amountPaid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <p className="text-gray-900">{selectedEnrollment.paymentStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-gray-900">{selectedEnrollment.paymentMethod || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Enrollment Date</label>
                  <p className="text-gray-900">
                    {selectedEnrollment.enrollmentDate 
                      ? new Date(selectedEnrollment.enrollmentDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                  <p className="text-gray-900">
                    {selectedEnrollment.enrollmentExpireDate 
                      ? new Date(selectedEnrollment.enrollmentExpireDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction Number</label>
                  <p className="text-gray-900 text-sm">{selectedEnrollment.transactionNumber || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Order ID</label>
                  <p className="text-gray-900 text-sm">{selectedEnrollment.orderId || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Student Name</label>
                  <p className="text-gray-900">{selectedEnrollment.studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Student Email</label>
                  <p className="text-gray-900">{selectedEnrollment.studentEmail || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Student Mobile</label>
                  <p className="text-gray-900">{selectedEnrollment.studentMobile || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned Teacher</label>
                  <p className="text-gray-900">{selectedEnrollment.teacherId || "Not Assigned"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Student Address</label>
                  <p className="text-gray-900">{selectedEnrollment.studentAddress || "N/A"}</p>
                </div>
                {selectedEnrollment.remarks && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Remarks</label>
                    <p className="text-gray-900">{selectedEnrollment.remarks}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4">
                {selectedEnrollment.pdfUrl && (
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => window.open(selectedEnrollment.pdfUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  );
}
