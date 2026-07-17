import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("superadmin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedIdentifier = localStorage.getItem("adminRememberedIdentifier");
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return toast.error("Please enter your email or mobile.");
    if (!password.trim()) return toast.error("Please enter your password.");
    
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
          localStorage.setItem("adminRememberedIdentifier", identifier);
        } else {
          localStorage.removeItem("adminRememberedIdentifier");
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

  if (!mounted) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] px-4 selection:bg-[#d4940a]/20 selection:text-[#0d1f5c]">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-[#0d1f5c]/5 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-bl from-[#d4940a]/10 to-transparent blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-[10%] left-[30%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#0d1f5c]/5 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[440px] z-10"
      >
        {/* Logo */}
        <motion.div
          className="mb-10 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="group flex items-center gap-3 cursor-default">
            <motion.div
              className="relative flex h-20 w-20 items-center justify-center rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/30 bg-[#0d1f5c]"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Shield className="h-10 w-10 text-white drop-shadow-lg" strokeWidth={2} />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            <div className="flex flex-col">
              <span className="font-bold text-2xl text-gray-900 tracking-tight leading-none">
                Admin Portal
              </span>
              <span className="text-xs text-gray-500 font-medium mt-1">
                Live Mentor Hub Management
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Card with Glass Morphism */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] ring-1 ring-gray-900/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          whileHover={{
            boxShadow: "0 20px 60px -12px rgba(0,0,0,0.2)",
          }}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0d1f5c] via-[#d4940a] to-[#0d1f5c]" />

          {/* Header */}
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold tracking-tight text-gray-900"
            >
              System Access
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-sm text-gray-600"
            >
              Authorized personnel only
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-full">
              <FloatingInput
                id="identifier"
                label="Admin Email or Phone"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div className="relative">
              <FloatingInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-[60%] text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100/50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={showPassword ? "hide" : "show"}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0d1f5c] focus:ring-[#0d1f5c] focus:ring-offset-0 transition-all"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => toast.info("Please contact system administrator to reset password.")}
                className="font-semibold text-[#d4940a] hover:text-[#e8a020] transition-colors bg-transparent border-0 outline-none cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#d4940a] via-[#e8a020] to-[#d4940a] hover:opacity-90 text-[#0d1f5c] shadow-xl shadow-[#d4940a]/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#d4940a]/30 border-0 py-3 px-4 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#d4940a]"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{
                    x: loading ? ["-100%", "100%"] : "-100%",
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: loading ? Infinity : 0,
                    ease: "linear",
                  }}
                />
                <span
                  className={`flex items-center justify-center gap-2 transition-opacity ${
                    loading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  Secure Login
                  <ArrowRight
                    className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1"
                    strokeWidth={2.5}
                  />
                </span>
                {loading && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Loader2
                      className="h-5 w-5 animate-spin text-[#0d1f5c]"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                )}
              </button>
            </motion.div>
          </motion.form>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium text-[#0d1f5c]/60">
              Admin connection secured
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FloatingInput({ id, label, type = "text", value, onChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`peer flex items-center w-full rounded-xl border-2 bg-white/50 backdrop-blur-sm px-4 py-3.5 text-sm text-gray-900 font-medium transition-all duration-300 ${
          focused || value
            ? "border-[#d4940a] bg-white shadow-[0_0_0_4px_rgba(212,148,10,0.1)]"
            : "border-gray-200 hover:border-gray-300 hover:bg-white"
        }`}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent outline-none placeholder-transparent"
          placeholder={label}
        />
      </div>
      <motion.label
        htmlFor={id}
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 pointer-events-none bg-white/0 px-2 font-medium ${
          focused || value
            ? "top-0 left-3 -translate-y-[140%] text-xs text-[#0d1f5c] font-bold bg-white/80 backdrop-blur-sm rounded-md"
            : "text-sm"
        }`}
        initial={false}
        animate={{ scale: 1 }}
      >
        {label}
      </motion.label>
      {(focused || value) && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#d4940a] to-[#e8a020] rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}
