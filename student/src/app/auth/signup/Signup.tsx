"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Mail,
  Phone,
  Lock,
  User,
  MapPin,
  Globe,
  UserCircle2,
  Locate,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/useAuth";
import { API_AUTH_BASE, AUTH_PATHS } from "@/lib/api";

const RESEND_DELAY = 30;

/* Country dial-codes for mobile (ALL countries) */
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

const COUNTRY_CODES = getCountries().map((country) => {
  const code = `+${getCountryCallingCode(country)}`;
  return { country, code };
});

const ALL_COUNTRIES = getCountries().map((code) => {
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
    const codePoints = code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    const flag = String.fromCodePoint(...codePoints);
    const dialCode = `+${getCountryCallingCode(code)}`;
    return { code, name, flag, dialCode };
  } catch (e) {
    const dialCode = `+${getCountryCallingCode(code)}`;
    return { code, name: code, flag: "", dialCode };
  }
}).sort((a, b) => a.name.localeCompare(b.name));

const normalizeDigits = (value: string) => value.replace(/\D+/g, "");

/**
 * Requirement:
 * - If country code is "+91" (2-digit code after +) => allow exactly 10 digits.
 * - Otherwise, if country code starts with "+9" and has 1 digit after + (ex: "+9") => allow 11 digits.
 * - Fallback => allow 10 digits.
 */
const TOTAL_DIGITS = 12;

const getAllowedMobileDigits = (code: string) => {
  // Remove "+" and keep only digits
  const countryDigits = (code || "").replace(/\D/g, "").length;

  // Remaining digits allowed for mobile number
  const allowed = TOTAL_DIGITS - countryDigits;

  // Safety fallback
  return allowed > 0 ? allowed : 10;
};

const validateMobile = (code: string, value: string, fieldLabel: string) => {
  const allowed = getAllowedMobileDigits(code);
  if (!value.trim() || value.trim().length !== allowed) {
    return `Please enter a valid ${allowed}-digit ${fieldLabel} number.`;
  }
  return "";
};

/* Geofence: India bounding box (approx). Adjust or make configurable if needed. */
const GEOFENCE = {
  minLat: 8.0,
  maxLat: 35.5,
  minLon: 68.0,
  maxLon: 97.5,
};

function isWithinGeofence(lat: number, lon: number): boolean {
  if (lat === 0 && lon === 0) return false;
  return (
    lat >= GEOFENCE.minLat &&
    lat <= GEOFENCE.maxLat &&
    lon >= GEOFENCE.minLon &&
    lon <= GEOFENCE.maxLon
  );
}

/* Reverse geocode using OpenStreetMap Nominatim (free, no API key needed) */
const reverseGeocode = async (
  lat: number,
  lon: number,
): Promise<{ address: string; country: string }> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "LiveMentorHub/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();

    // Extract address components
    const addressParts: string[] = [];

    if (data.address?.city) {
      addressParts.push(data.address.city);
    } else if (data.address?.town) {
      addressParts.push(data.address.town);
    } else if (data.address?.village) {
      addressParts.push(data.address.village);
    } else if (data.address?.suburb) {
      addressParts.push(data.address.suburb);
    }

    if (data.address?.state) {
      addressParts.push(data.address.state);
    }

    if (data.address?.country) {
      addressParts.push(data.address.country);
    }

    const fullAddress = addressParts.join(", ");
    const country = data.address?.country || "India";

    return { address: fullAddress, country };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return { address: "", country: "India" };
  }
};

type Step = "details" | "otp" | "success";

export default function SignupPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const [step, setStep] = useState<Step>("details");

  /* ── Student fields ── */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileCode, setMobileCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState("India");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [autoFilledFromLocation, setAutoFilledFromLocation] = useState(false);

  /* ── Search Dropdowns states ── */
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [showMobileCodeDropdown, setShowMobileCodeDropdown] = useState(false);
  const [mobileCodeSearch, setMobileCodeSearch] = useState("");
  const mobileCodeDropdownRef = useRef<HTMLDivElement>(null);

  const [showParentMobileCodeDropdown, setShowParentMobileCodeDropdown] = useState(false);
  const [parentMobileCodeSearch, setParentMobileCodeSearch] = useState("");
  const parentMobileCodeDropdownRef = useRef<HTMLDivElement>(null);

  const [activeModal, setActiveModal] = useState<"terms" | "privacy" | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (mobileCodeDropdownRef.current && !mobileCodeDropdownRef.current.contains(event.target as Node)) {
        setShowMobileCodeDropdown(false);
      }
      if (parentMobileCodeDropdownRef.current && !parentMobileCodeDropdownRef.current.contains(event.target as Node)) {
        setShowParentMobileCodeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Parent fields ── */
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentMobile, setParentMobile] = useState("");
  const [parentMobileCode, setParentMobileCode] = useState("+91");

  /* ── OTP state ── */
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [studentId, setStudentId] = useState("");

  /* ── UI state ── */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  /* ── Timer ── */
  const startResendTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendCooldown(RESEND_DELAY);
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /* ── Register → sends OTP ── */
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your full name.");
    if (!email.trim()) return setError("Please enter your email.");

    const mobileError = validateMobile(mobileCode, mobile, "mobile");
    if (mobileError) return setError(mobileError);

    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    /* Validate parent details */
    if (!parentName.trim()) return setError("Please enter parent's name.");
    if (!parentEmail.trim()) return setError("Please enter parent's email.");

    const parentMobileError = validateMobile(
      parentMobileCode,
      parentMobile,
      "parent mobile",
    );
    if (parentMobileError) return setError(parentMobileError);

    if (!gender) return setError("Please select gender.");

    /* Geofencing: require location and that it's within allowed region */
    if (latitude === 0 && longitude === 0) {
      setError(
        'Please use "Use my location" to verify your location. Signup requires your location.',
      );
      return;
    }
    if (!isWithinGeofence(latitude, longitude)) {
      setError(
        "Signup is only available in the allowed region. Your location is outside the service area.",
      );
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH_BASE}${AUTH_PATHS.registerStudent}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile: mobileCode + mobile,
          password,
          country,
          gender,
          parentName,

          parentEmail,
          parentMobile: parentMobileCode + parentMobile,
          address,
          latitude,
          longitude,
          playerId: "",
          deviceType: "web",
          role: "student",
        }),
      });
      const data = await res.json();
      if (!res.ok || (!data.status && !data.success))
        throw new Error(data.message || "Registration failed.");
      setStudentId(data.studentId || "");
      setStep("otp");
      startResendTimer();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await fetch(`${API_AUTH_BASE}${AUTH_PATHS.resendOtp}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, role: "student" }),
      });
      setOtp(["", "", "", "", "", ""]);
      startResendTimer();
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  /* ── Verify OTP → login ── */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return setError("Please enter the full 6-digit code.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH_BASE}${AUTH_PATHS.verifyOtp}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, otp: code, role: "student" }),
      });
      const data = await res.json();

      // Check for status or success flag for robustness
      if (!res.ok || (!data.status && !data.success)) {
        throw new Error(data.message || "Invalid OTP.");
      }

      // CRITICAL: Save the token if provided
      if (data.token) {
        localStorage.setItem("cp_token", data.token);
      }

      const userObj = data.user || data.userData || {};
      const finalemail =
        userObj.email ||
        data.email ||
        userObj.userId ||
        data.userId ||
        email ||
        "";
      const studentId =
        userObj.studentId ||
        data.studentId ||
        userObj.userId ||
        data.userId ||
        data.specificId ||
        "";
      const countryValue = userObj.country || country || "";

      login({
        name: userObj.name || name,
        email: userObj.email || email,
        studentId: studentId,
        country: countryValue,
      });

      // Store in localStorage for easier access
      if (studentId) {
        localStorage.setItem("studentId", studentId);
      }
      if (countryValue) {
        localStorage.setItem("country", countryValue);
      }
      if (data.token) {
        localStorage.setItem("cp_token", data.token);
      }

      setStep("success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP box handlers ── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  /* ── Get current location (latitude/longitude) and auto-fill address ── */
  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by your browser.");
      return;
    }
    setLocationError(null);
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        // Reverse geocode to get address and country
        const locationData = await reverseGeocode(lat, lon);

        if (locationData.address) {
          setAddress(locationData.address);
          setAutoFilledFromLocation(true);
        }

        if (locationData.country) {
          setCountry(locationData.country);
        }

        setLocationError(null);
        setLocationLoading(false);
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location permission denied. Please allow location access to sign up."
            : err.code === 2
              ? "Location unavailable. Check your device location and try again."
              : "Could not get location. Use HTTPS and allow location access.";
        setLocationError(msg);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const selectedCountry = ALL_COUNTRIES.find(c => c.name.toLowerCase() === country.toLowerCase()) || ALL_COUNTRIES.find(c => c.code.toLowerCase() === country.toLowerCase());
  
  const filteredCountries = ALL_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedMobileCountry = 
    ALL_COUNTRIES.find(c => c.dialCode === mobileCode && c.name.toLowerCase() === country.toLowerCase()) ||
    ALL_COUNTRIES.find(c => c.dialCode === mobileCode);
  
  const filteredMobileCountries = ALL_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(mobileCodeSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(mobileCodeSearch.toLowerCase()) ||
    c.dialCode.includes(mobileCodeSearch)
  );

  const selectedParentMobileCountry = 
    ALL_COUNTRIES.find(c => c.dialCode === parentMobileCode && c.name.toLowerCase() === country.toLowerCase()) ||
    ALL_COUNTRIES.find(c => c.dialCode === parentMobileCode);
  
  const filteredParentMobileCountries = ALL_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(parentMobileCodeSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(parentMobileCodeSearch.toLowerCase()) ||
    c.dialCode.includes(parentMobileCodeSearch)
  );

  if (!mounted) return null;

  /* ─────────── UI ─────────── */
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] px-4 py-10 selection:bg-[#d4940a]/20 selection:text-[#0d1f5c]">
      {/* BG Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-[#0d1f5c]/5 to-transparent blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-bl from-[#d4940a]/10 to-transparent blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[92vw] sm:max-w-[520px] md:max-w-[620px] lg:max-w-[720px] z-10"
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-3xl overflow-hidden shadow-xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <img
                src="/logo.png"
                alt="Live Mentor Hub Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>

            <div className="flex flex-col">
              <span className="font-bold text-2xl text-gray-900 tracking-tight leading-none">
                Live Mentor Hub
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Education Platform
              </span>
            </div>
          </Link>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] ring-1 ring-gray-900/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0d1f5c] via-[#d4940a] to-[#0d1f5c]" />

          <AnimatePresence mode="wait">
            {/* ─── STEP 1: Registration Details ─── */}
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Create Student Account
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Fill in your details to get started
                  </p>
                </div>

                <form onSubmit={handleCreateAccount} className="space-y-4">
                  {/* ── Student Info ── */}
                  <p className="text-xs font-bold text-[#d4940a] uppercase tracking-widest">
                    Student Details
                  </p>

                  {/* Full name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-gray-500 ml-1 block uppercase tracking-wider">
                      Full Name <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        required
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d4940a] focus:ring-4 focus:ring-[#d4940a]/10 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-gray-500 ml-1 block uppercase tracking-wider">
                      Email Address <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        required
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d4940a] focus:ring-4 focus:ring-[#d4940a]/10 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-gray-500 ml-1 block uppercase tracking-wider">
                      Mobile Number <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative" ref={mobileCodeDropdownRef}>
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                      <div className={cn(
                        "flex items-center w-full sm:items-center border-2 rounded-xl transition-all",
                        showMobileCodeDropdown
                          ? "bg-white border-[#d4940a] ring-4 ring-[#d4940a]/10"
                          : "bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-[#d4940a] focus-within:ring-4 focus-within:ring-[#d4940a]/10"
                      )}>
                        <div className="relative w-24 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowMobileCodeDropdown(!showMobileCodeDropdown)}
                            className="w-full py-3 pl-10 pr-2 text-sm font-medium text-gray-500 outline-none cursor-pointer flex items-center justify-between bg-transparent border-0"
                          >
                            <span className="flex items-center gap-1.5">
                              {selectedMobileCountry ? (
                                <img
                                  src={`https://flagcdn.com/w20/${selectedMobileCountry.code.toLowerCase()}.png`}
                                  alt={selectedMobileCountry.name}
                                  className="w-5 h-auto object-contain rounded-sm"
                                />
                              ) : (
                                <span className="text-base">🏳️</span>
                              )}
                              <span>{mobileCode}</span>
                            </span>
                            <ChevronDown className="h-3 w-3 text-gray-400" />
                          </button>
                          
                          {showMobileCodeDropdown && (
                            <div className="absolute z-50 mt-1 left-0 w-72 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-2 space-y-2">
                              <input
                                type="text"
                                placeholder="Search country/code..."
                                value={mobileCodeSearch}
                                onChange={(e) => setMobileCodeSearch(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#d4940a]"
                              />
                              <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                                {filteredMobileCountries.map((c) => (
                                  <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => {
                                      setMobileCode(c.dialCode);
                                      setShowMobileCodeDropdown(false);
                                      setMobileCodeSearch("");
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer bg-transparent border-0"
                                  >
                                    <img
                                      src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                                      alt={c.name}
                                      className="w-5 h-auto object-contain rounded-sm"
                                    />
                                    <span className="flex-1 text-gray-800 font-medium truncate">{c.name}</span>
                                    <span className="text-xs text-gray-500 font-semibold">{c.dialCode}</span>
                                  </button>
                                ))}
                                {filteredMobileCountries.length === 0 && (
                                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                    No matches
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="h-6 w-[1px] bg-gray-200" />
                        <input
                          required
                          type="tel"
                          placeholder={`${getAllowedMobileDigits(mobileCode)}-digit mobile number`}
                          value={mobile}
                          onChange={(e) => {
                            const digits = normalizeDigits(e.target.value);

                            // restrict length immediately
                            setMobile(
                              digits.slice(0, getAllowedMobileDigits(mobileCode)),
                            );

                            setError("");
                          }}
                          maxLength={getAllowedMobileDigits(mobileCode)}
                          className="flex-1 py-3 pl-4 pr-4 rounded-r-xl outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent border-0 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-gray-500 ml-1 block uppercase tracking-wider">
                      Password <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="Password (min 6 characters)"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d4940a] focus:ring-4 focus:ring-[#d4940a]/10 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-gray-500 ml-1 block uppercase tracking-wider">
                        Gender
                      </label>
                      <div className="relative">
                        <UserCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          required
                          value={gender}
                          onChange={(e) => {
                            setGender(e.target.value as typeof gender);
                            setError("");
                          }}
                          className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d4940a] focus:ring-4 focus:ring-[#d4940a]/10 outline-none transition-all text-sm text-gray-900"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* spacer to keep grid alignment on sm */}
                    <div />
                  </div>

                  {/* Geofencing: Latitude / Longitude — required for signup */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-600">
                      Location (required for signup)
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        disabled={locationLoading}
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                          latitude !== 0 || longitude !== 0
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#d4940a]/30 hover:bg-[#d4940a]/5 hover:text-[#d4940a]",
                        )}
                      >
                        {locationLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Locate className="h-4 w-4" />
                        )}
                        {locationLoading
                          ? "Getting location…"
                          : "Use my location"}
                      </button>
                      {(latitude !== 0 || longitude !== 0) && (
                        <span className="text-xs text-gray-500">
                          {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                          {isWithinGeofence(latitude, longitude) && (
                            <span className="ml-1 text-green-600">
                              ✓ In region
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    {locationError && (
                      <p className="text-red-500 text-xs">{locationError}</p>
                    )}
                    {(latitude !== 0 || longitude !== 0) &&
                      !isWithinGeofence(latitude, longitude) && (
                        <p className="text-amber-600 text-xs">
                          Your location is outside the allowed signup region.
                        </p>
                      )}
                  </div>

                  {/* Country + Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-gray-500 ml-1 block uppercase tracking-wider">
                        Country
                      </label>
                      <div className="relative" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className={cn(
                            "w-full pl-10 pr-10 py-3 rounded-xl border-2 transition-all text-sm text-gray-900 flex items-center justify-between cursor-pointer outline-none",
                            showCountryDropdown
                              ? "bg-white border-[#d4940a] ring-4 ring-[#d4940a]/10"
                              : "bg-gray-50 border-gray-200 focus:bg-white focus:border-[#d4940a]"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            {selectedCountry ? (
                              <span className="flex items-center gap-2">
                                <img 
                                  src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`} 
                                  alt={selectedCountry.name} 
                                  className="w-5 h-auto object-contain rounded-sm"
                                />
                                <span>{selectedCountry.name}</span>
                              </span>
                            ) : (
                              <span className="text-gray-400">{country || "Select Country"}</span>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                        
                        {showCountryDropdown && (
                          <div className="absolute z-50 mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg p-2 space-y-2">
                            <input
                              type="text"
                              placeholder="Search country..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#d4940a]"
                            />
                            <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                              {filteredCountries.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setCountry(c.name);
                                    setShowCountryDropdown(false);
                                    setCountrySearch("");
                                    if (autoFilledFromLocation) {
                                      setAutoFilledFromLocation(false);
                                    }
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer bg-transparent border-0"
                                >
                                  <img 
                                    src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} 
                                    alt={c.name} 
                                    className="w-5 h-auto object-contain rounded-sm"
                                  />
                                  <span className="flex-1 text-gray-800 font-medium">{c.name}</span>
                                  <span className="text-xs text-gray-400">{c.code}</span>
                                </button>
                              ))}
                              {filteredCountries.length === 0 && (
                                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                  No countries found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-gray-500 ml-1 block uppercase tracking-wider">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Address"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            // Clear auto-fill flag when user manually edits
                            if (autoFilledFromLocation) {
                              setAutoFilledFromLocation(false);
                            }
                          }}
                          className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d4940a] focus:ring-4 focus:ring-[#d4940a]/10 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  

                  

                  {/* ── Parent Details ── */}
                  <p className="text-xs font-bold text-[#d4940a] uppercase tracking-widest pt-2">
                    Parent Details
                  </p>

                  {/* Parent Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-gray-500 ml-1 block uppercase tracking-wider">
                      Parent's Name <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        required
                        type="text"
                        placeholder="Parent's Name"
                        value={parentName}
                        onChange={(e) => {
                          setParentName(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d4940a] focus:ring-4 focus:ring-[#d4940a]/10 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Parent Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-gray-500 ml-1 block uppercase tracking-wider">
                      Parent's Email Address <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        required
                        type="email"
                        placeholder="Parent's Email Address"
                        value={parentEmail}
                        onChange={(e) => {
                          setParentEmail(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d4940a] focus:ring-4 focus:ring-[#d4940a]/10 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Parent Mobile */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-gray-500 ml-1 block uppercase tracking-wider">
                      Parent's Mobile Number <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative" ref={parentMobileCodeDropdownRef}>
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                      <div className={cn(
                        "flex items-center w-full border-2 rounded-xl transition-all",
                        showParentMobileCodeDropdown
                          ? "bg-white border-[#d4940a] ring-4 ring-[#d4940a]/10"
                          : "bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-[#d4940a] focus-within:ring-4 focus-within:ring-[#d4940a]/10"
                      )}>
                        <div className="relative w-24 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowParentMobileCodeDropdown(!showParentMobileCodeDropdown)}
                            className="w-full py-3 pl-10 pr-2 text-sm font-medium text-gray-500 outline-none cursor-pointer flex items-center justify-between bg-transparent border-0"
                          >
                            <span className="flex items-center gap-1.5">
                              {selectedParentMobileCountry ? (
                                <img
                                  src={`https://flagcdn.com/w20/${selectedParentMobileCountry.code.toLowerCase()}.png`}
                                  alt={selectedParentMobileCountry.name}
                                  className="w-5 h-auto object-contain rounded-sm"
                                />
                              ) : (
                                <span className="text-base">🏳️</span>
                              )}
                              <span>{parentMobileCode}</span>
                            </span>
                            <ChevronDown className="h-3 w-3 text-gray-400" />
                          </button>
                          
                          {showParentMobileCodeDropdown && (
                            <div className="absolute z-50 mt-1 left-0 w-72 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-2 space-y-2">
                              <input
                                type="text"
                                placeholder="Search country/code..."
                                value={parentMobileCodeSearch}
                                onChange={(e) => setParentMobileCodeSearch(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#d4940a]"
                              />
                              <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                                {filteredParentMobileCountries.map((c) => (
                                  <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => {
                                      setParentMobileCode(c.dialCode);
                                      setShowParentMobileCodeDropdown(false);
                                      setParentMobileCodeSearch("");
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer bg-transparent border-0"
                                  >
                                    <img
                                      src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                                      alt={c.name}
                                      className="w-5 h-auto object-contain rounded-sm"
                                    />
                                    <span className="flex-1 text-gray-800 font-medium truncate">{c.name}</span>
                                    <span className="text-xs text-gray-500 font-semibold">{c.dialCode}</span>
                                  </button>
                                ))}
                                {filteredParentMobileCountries.length === 0 && (
                                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                    No matches
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="h-6 w-[1px] bg-gray-200" />
                        <input
                          required
                          type="tel"
                          placeholder={`Parent's ${getAllowedMobileDigits(parentMobileCode)}-digit mobile number`}
                          value={parentMobile}
                          onChange={(e) => {
                            const digits = normalizeDigits(e.target.value);

                            setParentMobile(
                              digits.slice(
                                0,
                                getAllowedMobileDigits(parentMobileCode),
                              ),
                            );

                            setError("");
                          }}
                          maxLength={getAllowedMobileDigits(parentMobileCode)}
                          className="flex-1 py-3 pl-4 pr-4 rounded-r-xl outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent border-0 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#d4940a] to-[#e8a020] hover:opacity-90 text-[#0d1f5c] shadow-lg shadow-[#d4940a]/20 rounded-xl h-12 font-semibold mt-2 border-0"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Create Account & Get OTP{" "}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="mt-5 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-bold text-[#d4940a] hover:text-[#e8a020] underline underline-offset-2"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ─── STEP 2: OTP Verification ─── */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="mb-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-[#d4940a]/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-[#d4940a]" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Verify Your Email
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    We sent a 6-digit code to
                    <br />
                    <span className="font-semibold text-gray-800">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP boxes */}
                  <div className="flex justify-center gap-2.5">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-[#d4940a] focus:ring-4 focus:ring-[#d4940a]/10 outline-none transition-all text-gray-900 bg-gray-50"
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                  )}

                  {/* Resend timer */}
                  <div className="text-center text-sm text-gray-500">
                    Didn&apos;t receive the code?{" "}
                    {resendCooldown > 0 ? (
                      <span className="text-gray-400">
                        Resend in{" "}
                        <span className="font-bold text-[#d4940a]">
                          {resendCooldown}s
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="font-bold text-[#d4940a] hover:text-[#e8a020] underline underline-offset-2 disabled:opacity-50"
                      >
                        {loading ? "Sending…" : "Resend OTP"}
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.join("").length < 6}
                    className="w-full h-12 bg-gradient-to-r from-[#d4940a] to-[#e8a020] hover:opacity-90 text-[#0d1f5c] shadow-lg shadow-[#d4940a]/20 rounded-xl font-semibold border-0"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Verify & Create Account"
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("details");
                      setOtp(["", "", "", "", "", ""]);
                      setError("");
                    }}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Change details
                  </button>
                </form>
              </motion.div>
            )}

            {/* ─── STEP 3: Success ─── */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Account Created!
                  </h2>
                  <p className="text-gray-500 text-sm mt-2">
                    Welcome to Live Mentor Hub, {name}!<br />
                    Redirecting you to your dashboard…
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {step === "details" && (
          <p className="mt-4 text-center text-xs text-gray-400">
            By creating an account you agree to our{" "}
            <button
              type="button"
              onClick={() => setActiveModal("terms")}
              className="underline hover:text-gray-600 text-[#0d1f5c] font-medium cursor-pointer bg-transparent border-0 p-0"
            >
              Terms
            </button>{" "}
            &{" "}
            <button
              type="button"
              onClick={() => setActiveModal("privacy")}
              className="underline hover:text-gray-600 text-[#0d1f5c] font-medium cursor-pointer bg-transparent border-0 p-0"
            >
              Privacy Policy
            </button>
            .
          </p>
        )}
      </motion.div>

      {/* Terms & Privacy Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-[#0d1f5c]">
                  {activeModal === "terms" ? "Terms & Conditions" : "Privacy Policy"}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-600 leading-relaxed scrollbar-thin">
                {activeModal === "terms" ? (
                  <>
                    <p className="font-semibold text-gray-800 text-base">Welcome to LiveMentorHub!</p>
                    <p>These terms and conditions outline the rules and regulations for the use of LiveMentorHub's website and learning platform.</p>
                    
                    <h4 className="font-bold text-gray-800 pt-2">1. Acceptance of Terms</h4>
                    <p>By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use LiveMentorHub's services if you do not agree to all of the terms and conditions stated on this page.</p>
                    
                    <h4 className="font-bold text-gray-800 pt-2">2. Accounts and Security</h4>
                    <p>To access certain features, you must register for an account. You are responsible for safeguarding your account password and for any activities or actions under your password. You agree to provide accurate and complete registration information.</p>
                    
                    <h4 className="font-bold text-gray-800 pt-2">3. User Conduct</h4>
                    <p>Users are expected to conduct themselves respectfully during mentoring sessions and classes. Any form of harassment, hate speech, or abuse will result in immediate account suspension without refund.</p>
                    
                    <h4 className="font-bold text-gray-800 pt-2">4. Payment and Fees</h4>
                    <p>All payments for courses and mentoring sessions must be made in full before session commencement. Payment terms are subject to change and specific refund policies apply to each package.</p>
                    
                    <h4 className="font-bold text-gray-800 pt-2">5. Intellectual Property</h4>
                    <p>All materials, contents, videos, resources, and designs provided by LiveMentorHub are the intellectual property of LiveMentorHub and may not be copied, distributed, or resold without prior written consent.</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-800 text-base">Privacy Policy for LiveMentorHub</p>
                    <p>At LiveMentorHub, accessible from our platform, one of our main priorities is the privacy of our visitors and students. This Privacy Policy document contains types of information that is collected and recorded by LiveMentorHub and how we use it.</p>
                    
                    <h4 className="font-bold text-gray-800 pt-2">1. Information We Collect</h4>
                    <p>We collect personal information that you provide to us, such as your full name, email address, phone number, location, and parent details (if you are a student) during account registration.</p>
                    
                    <h4 className="font-bold text-gray-800 pt-2">2. How We Use Your Information</h4>
                    <p>We use the information we collect in various ways, including to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Provide, operate, and maintain our platform</li>
                      <li>Improve, personalize, and expand our services</li>
                      <li>Understand and analyze how you use our platform</li>
                      <li>Communicate with you for customer support, updates, and marketing</li>
                      <li>Detect and prevent fraudulent transactions</li>
                    </ul>
                    
                    <h4 className="font-bold text-gray-800 pt-2">3. Data Security</h4>
                    <p>We use commercial-grade security measures to protect your personal data from unauthorized access, loss, or misuse. However, no electronic transmission over the internet can be guaranteed 100% secure.</p>
                    
                    <h4 className="font-bold text-gray-800 pt-2">4. Sharing Your Data</h4>
                    <p>We do not sell, rent, or share your personal data with third parties except to process payments (e.g. Cashfree) or comply with legal requirements.</p>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
                <Button
                  onClick={() => setActiveModal(null)}
                  className="bg-[#0d1f5c] hover:bg-[#1a2747] text-white rounded-xl px-5"
                >
                  I Understand
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
