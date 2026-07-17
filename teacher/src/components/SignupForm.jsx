import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { theme } from "../theme";
import PhoneNumberInput, { ALL_COUNTRIES } from "./PhoneNumberInput";
import { Eye, EyeOff, Globe, ChevronDown, Locate, Loader2 } from "lucide-react";

// Reverse geocode to fetch city, state, country via OpenStreetMap's Nominatim API
const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "LiveMentorHub/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();
    const addressParts = [];

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

const SignupForm = ({ onSwitchToLogin, onSignupSuccess, onStepChange }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    qualification: "",
    password: "",
    confirmPassword: "",
    address: "",
    country: "India",
    gender: "Male",
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState("signup");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Searchable Country Dropdown and Geolocation states
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const countryDropdownRef = useRef(null);

  // Click outside country dropdown handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch current browser location & auto-fill Address and Country
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

        const locationData = await reverseGeocode(lat, lon);

        setFormData((prev) => ({
          ...prev,
          address: locationData.address || prev.address,
          country: locationData.country || prev.country,
        }));

        setLocationError(null);
        setLocationLoading(false);
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location permission denied. Please allow location access."
            : err.code === 2
              ? "Location unavailable. Check device settings."
              : "Could not get location. Allow access and use HTTPS.";
        setLocationError(msg);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const selectedCountry = ALL_COUNTRIES.find(
    (c) => c.name.toLowerCase() === formData.country.toLowerCase()
  ) || ALL_COUNTRIES.find(
    (c) => c.code.toLowerCase() === formData.country.toLowerCase()
  );

  const filteredCountries = ALL_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !phoneNumber ||
      !formData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const fullMobile = phoneNumber;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/register/teacher`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            mobile: fullMobile,
            qualification: formData.qualification,
            password: formData.password,
            address: formData.address,
            country: formData.country,
            gender: formData.gender,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        onStepChange?.("otp");
        setResendTimer(30);
        setCanResend(false);
        toast.success("OTP sent to your email id!");
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      toast.error("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (step !== "otp") return;

    if (resendTimer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullMobile = phoneNumber;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: fullMobile,
            otp: otp,
            role: "teacher",
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Account verified successfully! Please login.");
        onSignupSuccess();
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error("An error occurred during OTP verification");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);

    try {
      const fullMobile = phoneNumber;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: fullMobile,
            role: "teacher",
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP resent successfully!");
        setResendTimer(30);
        setCanResend(false);
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("An error occurred while resending OTP");
    } finally {
      setLoading(false);
    }
  };
  if (step === "otp") {
    const handleBack = () => { setStep("signup"); onStepChange?.("signup"); };
    return (
      <div className="w-full">
        <div className="text-center mb-6">
          <h2
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            Verify OTP
          </h2>
          <p
            className="text-base md:text-lg"
            style={{ color: theme.colors.textSecondary }}
          >
            Enter the OTP sent to your mobile number
          </p>
        </div>

        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              OTP
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
              style={{
                borderColor: theme.colors.border,
                "--tw-ring-color": theme.colors.primary,
              }}
              required
              maxLength={6}
            />
          </div>
          <div className="mb-3 text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend || loading}
              className="text-sm font-medium disabled:opacity-50"
              style={{ color: theme.colors.primary }}
            >
              {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-2 rounded-md font-semibold transition disabled:opacity-50 mb-3"
            style={{ backgroundColor: theme.colors.primary }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = theme.colors.primaryDark)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = theme.colors.primary)
            }
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading}
            className="w-full text-white py-2 rounded-md font-semibold transition disabled:opacity-50"
            style={{ backgroundColor: theme.colors.secondary }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = theme.colors.cardHover)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = theme.colors.secondary)
            }
          >
            {loading ? "Sending..." : "Resend OTP"}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="w-full mt-4 text-sm font-semibold text-[#d4940a] hover:text-[#e8a020] transition-colors cursor-pointer"
          >
            ← Back to Sign up
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: theme.colors.textPrimary }}
        >
          Create Account
        </h2>
        <p
          className="text-base md:text-lg"
          style={{ color: theme.colors.textSecondary }}
        >
          Sign up as a Teacher
        </p>
      </div>

      <form onSubmit={handleSignup}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
          {/* Name */}
          <div className="mb-4">
            <label
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
              style={{
                borderColor: theme.colors.border,
                "--tw-ring-color": theme.colors.primary,
              }}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
              style={{
                borderColor: theme.colors.border,
                "--tw-ring-color": theme.colors.primary,
              }}
              required
            />
          </div>

          {/* Mobile with Country Code */}
          <div className="mb-4">
            <label
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <PhoneNumberInput value={phoneNumber} onChange={setPhoneNumber} />
            </div>
          </div>

          {/* Qualification */}
          <div className="mb-4">
            <label
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Qualification
            </label>
            <input
              type="text"
              name="qualification"
              placeholder="e.g., B.Sc, M.Sc, B.Ed"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
              style={{
                borderColor: theme.colors.border,
                "--tw-ring-color": theme.colors.primary,
              }}
            />
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
              style={{
                borderColor: theme.colors.border,
                "--tw-ring-color": theme.colors.primary,
              }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Country Selection Dropdown */}
          <div className="mb-4">
            <label
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Country <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1" ref={countryDropdownRef}>
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="w-full pl-4 pr-10 py-2 border rounded-md transition-all text-sm text-gray-900 flex items-center justify-between cursor-pointer outline-none bg-white min-h-[42px]"
                style={{ borderColor: theme.colors.border }}
              >
                <div className="flex items-center gap-2">
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
                    <span className="text-gray-400">{formData.country || "Select Country"}</span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showCountryDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg p-2 space-y-2 max-h-64 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#d4940a]"
                    autoFocus
                  />
                  <div className="max-h-40 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                    {filteredCountries.map((c, i) => (
                      <button
                        key={`${c.code}-${i}`}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, country: c.name }));
                          setShowCountryDropdown(false);
                          setCountrySearch("");
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer bg-transparent border-0"
                      >
                        <img 
                          src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} 
                          alt={c.name} 
                          className="w-5 h-auto object-contain rounded-sm"
                        />
                        <span className="flex-1 text-gray-800 font-medium">{c.name}</span>
                        <span className="text-xs text-gray-500 font-semibold">{c.dialCode}</span>
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        No matches
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address with Geolocation Action */}
          <div className="mb-4 md:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                Address
              </label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locationLoading}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                  latitude !== 0 || longitude !== 0
                    ? "border-green-300 bg-green-50 text-green-800"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#d4940a]/30 hover:bg-[#d4940a]/5 hover:text-[#d4940a]"
                }`}
              >
                {locationLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Locate className="h-3.5 w-3.5" />
                )}
                {locationLoading ? "Getting location…" : "Use my location"}
              </button>
            </div>
            
            <input
              type="text"
              name="address"
              placeholder="South Delhi, Delhi, 110002"
              value={formData.address}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
              style={{
                borderColor: theme.colors.border,
                "--tw-ring-color": theme.colors.primary,
              }}
            />
            {locationError && (
              <p className="text-red-500 text-xs mt-1">{locationError}</p>
            )}
            {latitude !== 0 && longitude !== 0 && (
              <p className="text-gray-400 text-xs mt-1">
                Coordinates: {latitude.toFixed(4)}°, {longitude.toFixed(4)}° (auto-filled)
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:outline-none pr-10"
                style={{
                  borderColor: theme.colors.border,
                  "--tw-ring-color": theme.colors.primary,
                }}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-gray-100/50"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:outline-none pr-10"
                style={{
                  borderColor: theme.colors.border,
                  "--tw-ring-color": theme.colors.primary,
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-gray-100/50"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white py-2 rounded-md font-semibold transition disabled:opacity-50"
          style={{ backgroundColor: theme.colors.primary }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = theme.colors.primaryDark)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = theme.colors.primary)
          }
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-[#d4940a] hover:text-[#e8a020] transition-colors underline decoration-2 underline-offset-2 cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default SignupForm;
