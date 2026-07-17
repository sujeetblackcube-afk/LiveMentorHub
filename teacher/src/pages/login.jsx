import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { theme } from "../theme";
import { initOneSignal, getWebPlayerId } from "../services/oneSignal";
import SignupForm from "../components/SignupForm";
import ForgotPassword from "../components/ForgotPassword";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState("teacher");
  const [loading, setLoading] = useState(false);
  
  // Auth mode: 'login', 'signup', 'forgot'
  const [authMode, setAuthMode] = useState("login");
  const [signupStep, setSignupStep] = useState("signup"); // track inner step for card sizing
  
  const { login } = useAuth();

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(error => {
        // console.log('Autoplay blocked:', error);
      });
    }

    const savedIdentifier = localStorage.getItem("rememberedIdentifier");
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        if (rememberMe) {
          localStorage.setItem("rememberedIdentifier", identifier);
        } else {
          localStorage.removeItem("rememberedIdentifier");
        }
        login(data.token, data.user, data.role);
        toast.success("Login successful!");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  // Handlers for switching between forms
  const handleSwitchToSignup = () => {
    setAuthMode("signup");
  };

  const handleSwitchToLogin = () => {
    setAuthMode("login");
  };

  const handleSwitchToForgot = () => {
    setAuthMode("forgot");
  };

  const handleSignupSuccess = () => {
    setAuthMode("login");
  };

  const handleBackToLogin = () => {
    setAuthMode("login");
  };

  // Render the appropriate form based on authMode
  const renderForm = () => {
    switch (authMode) {
      case "signup":
        return (
          <SignupForm 
            onSwitchToLogin={handleSwitchToLogin} 
            onSignupSuccess={handleSignupSuccess}
            onStepChange={setSignupStep}
          />
        );
      case "forgot":
        return (
          <ForgotPassword 
            onBackToLogin={handleBackToLogin}
          />
        );
      default:
        return (
          <div className="w-full">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to access your account
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-2 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-1.5 ring-1 ring-gray-200/50">
              <div className="relative flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold transition-all duration-300 bg-gradient-to-br from-[#0d1f5c] to-[#1a2456] shadow-lg shadow-[#0d1f5c]/20 text-white">
                <span className="relative z-10 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-circle-2 drop-shadow-sm"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>
                  Teacher
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <div className="peer flex items-center w-full rounded-xl border-2 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 font-medium transition-all duration-300 border-gray-200 hover:border-gray-300 focus-within:border-[#d4940a] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(212,148,10,0.1)]">
                  <input
                    type="text"
                    placeholder="Email or Phone Number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-transparent outline-none placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <div className="peer flex items-center w-full rounded-xl border-2 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 font-medium transition-all duration-300 border-gray-200 hover:border-gray-300 focus-within:border-[#d4940a] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(212,148,10,0.1)]">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none pr-10 placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100/50 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-all"
                  />
                  <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleSwitchToForgot}
                  className="font-semibold text-[#d4940a] hover:text-[#e8a020] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center items-center gap-2 overflow-hidden bg-gradient-to-r from-[#d4940a] via-[#e8a020] to-[#d4940a] hover:opacity-90 text-[#0d1f5c] shadow-xl shadow-[#d4940a]/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#d4940a]/30 border-0 py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? "Logging in..." : (
                  <>
                    Sign in
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={handleSwitchToSignup}
                className="font-bold text-[#d4940a] hover:text-[#e8a020] transition-colors underline decoration-2 underline-offset-2 cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          </div>
        );
    }
  };

  const cardMaxWidthClass =
    authMode === "signup" && signupStep === "signup"
      ? "max-w-[92vw] sm:max-w-[520px] md:max-w-[620px] lg:max-w-[720px]"
      : "max-w-[440px]";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] px-4 sm:px-6 lg:px-8 selection:bg-[#d4940a]/20 selection:text-[#0d1f5c]">
      <div className={`relative w-full ${cardMaxWidthClass} z-10 transition-all duration-300`}>
        
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <div className="group flex items-center gap-3">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/30 bg-white">
              <img
                src="/teacher/logo.png"
                alt="Live Mentor Hub Logo"
                className="w-full h-full object-contain p-2"
                onError={(e) => { e.target.onerror = null; e.target.src = '/vite.svg'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-gray-900 tracking-tight leading-none">
                Live Mentor Hub
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Teacher Portal
              </span>
            </div>
          </div>
        </div>

        {/* Main Card with Glass Morphism */}
        <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] ring-1 ring-gray-900/5">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0d1f5c] via-[#d4940a] to-[#0d1f5c]" />
          
          {renderForm()}
        </div>

        {/* Trust Badge commented out per user request
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-[#d4940a] animate-pulse" />
            <span className="font-medium text-[#0d1f5c]/60">
              Secured by SSL
            </span>
          </div>
        </div>
        */}

      </div>
    </div>
  );
};

export default Login;
