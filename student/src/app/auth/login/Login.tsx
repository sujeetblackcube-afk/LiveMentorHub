"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  UserCircle2,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { API_AUTH_BASE, AUTH_PATHS } from "@/lib/api";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

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

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [role, setRole] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [mobileCode, setMobileCode] = useState("+91");

  const normalizeDigits = (v: string) => v.replace(/\D/g, "");

  /**
   * Total digits including country code = 12
   * +91   => 10 mobile digits
   * +631  => 9 mobile digits
   * +1    => 11 mobile digits
   */
  const TOTAL_DIGITS = 12;

  const getAllowedMobileDigits = (callingCode: string) => {
    const countryDigits = (callingCode || "").replace(/\D/g, "").length;

    const allowed = TOTAL_DIGITS - countryDigits;

    return allowed > 0 ? allowed : 10;
  };

  const identifierDigits = normalizeDigits(identifier);

  const isDigitsOnly =
    identifierDigits.length > 0 && /^[0-9]+$/.test(identifierDigits);

  const getPhoneIdentifierValue = () => {
    const digits = normalizeDigits(identifier);
    if (!digits) return "";
    return `${mobileCode}${digits}`;
  };

  const phoneCodeOptions = getCountries().map((country) => {
    const code = `+${getCountryCallingCode(country)}`;
    return { country, code };
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [showMobileCodeDropdown, setShowMobileCodeDropdown] = useState(false);
  const [mobileCodeSearch, setMobileCodeSearch] = useState("");
  const mobileCodeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileCodeDropdownRef.current && !mobileCodeDropdownRef.current.contains(event.target as Node)) {
        setShowMobileCodeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedMobileCountry = useMemo(() => {
    const savedCountry = typeof window !== "undefined" ? localStorage.getItem("country") : "";
    return (
      ALL_COUNTRIES.find(c => c.dialCode === mobileCode && c.name.toLowerCase() === (savedCountry || "").toLowerCase()) ||
      ALL_COUNTRIES.find(c => c.dialCode === mobileCode)
    );
  }, [mobileCode]);

  const filteredMobileCountries = useMemo(() => {
    return ALL_COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(mobileCodeSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(mobileCodeSearch.toLowerCase()) ||
      c.dialCode.includes(mobileCodeSearch)
    );
  }, [mobileCodeSearch]);

  useEffect(() => {
    setMounted(true);
    const savedIdentifier = localStorage.getItem("rememberedIdentifier");
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/student/dashboard");
    }
  }, [isAuthenticated, router]);

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim())
      return setError("Please enter your email or mobile.");
    if (!password.trim()) return setError("Please enter your password.");
    setError("");
    setLoading(true);
    try {
      const identifierValue = isDigitsOnly
        ? getPhoneIdentifierValue()
        : identifier;
      const body = { identifier: identifierValue, password, role };

      const res = await fetch(`${API_AUTH_BASE}${AUTH_PATHS.login}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data?.status === false) {
        const message =
          data?.message ||
          (res.status === 404
            ? "Email or mobile not found."
            : res.status === 401
              ? "Incorrect password."
              : "Login failed. Please check your credentials.");
        throw new Error(message);
      }
      const userObj = data.user || data.userData || {};
      const studentId =
        userObj.studentId ||
        data.studentId ||
        userObj.userId ||
        data.userId ||
        data.specificId ||
        "";
      const country = userObj.country || "";

      login({
        name: userObj.name || identifier.split("@")[0],
        email: userObj.email || identifier,
        studentId: studentId,
        country: country,
      });
      if (data.token) localStorage.setItem("cp_token", data.token);
      if (studentId) {
        localStorage.setItem("studentId", studentId);
      }
      if (country) {
        localStorage.setItem("country", country);
      }

      if (rememberMe) {
        localStorage.setItem("rememberedIdentifier", identifier);
      } else {
        localStorage.removeItem("rememberedIdentifier");
      }

      toast.success("Logged in successfully!");
      router.push("/student/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const socialVariants = {
    hover: {
      scale: 1.02,
      y: -2,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98, y: 0 },
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
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              className="relative flex h-24 w-24 items-center justify-center rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img
                src="/logo.png"
                alt="Live Mentor Hub Logo"
                className="w-full h-full object-contain"
              />

              <motion.div
                className="absolute inset-0 rounded-2xl bg-white"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.3 }}
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
              Welcome back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-sm text-gray-600"
            >
              Sign in to access your account
            </motion.p>
          </div>

          {/* Enhanced Role Selector */}
          <LayoutGroup>
            <motion.div
              className="mb-8 grid grid-cols-1 gap-2 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-1.5 ring-1 ring-gray-200/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              {(["student"] as const).map((r) => {
                const isSelected = role === r;
                const Icon = r === "student" ? GraduationCap : UserCircle2;
                return (
                  <motion.button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                      "relative flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                      isSelected
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-800",
                    )}
                    whileHover={{ scale: isSelected ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeRole"
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#0d1f5c] to-[#1a2456] shadow-lg shadow-[#0d1f5c]/20"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon
                        className={cn(
                          "h-4.5 w-4.5",
                          isSelected && "drop-shadow-sm",
                        )}
                        strokeWidth={2.5}
                      />
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </LayoutGroup>

          {/* Form */}
          <motion.form
            onSubmit={handleLogin}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center w-full gap-3">
              {isDigitsOnly && (
                <div className="relative w-[115px] flex-shrink-0" ref={mobileCodeDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowMobileCodeDropdown(!showMobileCodeDropdown)}
                    className={cn(
                      "w-full h-[58px] rounded-xl border-2 px-3 text-sm text-gray-700 outline-none flex items-center justify-between cursor-pointer transition-all duration-300",
                      showMobileCodeDropdown
                        ? "bg-white border-[#d4940a] shadow-[0_0_0_4px_rgba(212,148,10,0.1)]"
                        : "bg-white/50 border-gray-200 hover:border-gray-300 hover:bg-white"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {selectedMobileCountry ? (
                        <img
                          src={`https://flagcdn.com/w20/${selectedMobileCountry.code.toLowerCase()}.png`}
                          alt={selectedMobileCountry.name}
                          className="w-5 h-auto object-contain rounded-sm"
                        />
                      ) : (
                        <span className="text-base leading-none">🏳️</span>
                      )}
                      <span className="font-semibold">{mobileCode}</span>
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
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

                              // trim number if code changed
                              const allowed = getAllowedMobileDigits(c.dialCode);
                              setIdentifier((prev) =>
                                normalizeDigits(prev).slice(0, allowed),
                              );
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
              )}

              <div className="flex-1">
                <FloatingInput
                  id="identifier"
                  label="Email or Phone Number"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s+/g, "");

                    // if typing number
                    if (/^\d*$/.test(value)) {
                      const allowed = getAllowedMobileDigits(mobileCode);

                      setIdentifier(normalizeDigits(value).slice(0, allowed));
                    } else {
                      // email
                      setIdentifier(value);
                    }
                  }}
                  maxLength={
                    isDigitsOnly
                      ? getAllowedMobileDigits(mobileCode)
                      : undefined
                  }
                  className={isDigitsOnly ? "rounded-l-none" : ""}
                />
              </div>
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
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-all"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="font-semibold text-[#d4940a] hover:text-[#e8a020] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                className="group relative w-full overflow-hidden bg-gradient-to-r from-[#d4940a] via-[#e8a020] to-[#d4940a] hover:opacity-90 text-[#0d1f5c] shadow-xl shadow-[#d4940a]/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#d4940a]/30 border-0"
                size="lg"
                disabled={loading}
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
                  className={cn(
                    "flex items-center justify-center gap-2 font-semibold transition-opacity",
                    loading ? "opacity-0" : "opacity-100",
                  )}
                >
                  Sign in
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
                      className="h-5 w-5 animate-spin text-white"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {role === "student" && (
            <motion.p
              className="mt-8 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-bold text-[#d4940a] hover:text-[#e8a020] transition-colors underline decoration-2 underline-offset-2"
              >
                Sign up free
              </Link>
            </motion.p>
          )}
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-[#d4940a] animate-pulse" />
            <span className="font-medium text-[#0d1f5c]/60">
              Secured by SSL
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  maxLength,
  className,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          "peer flex items-center w-full rounded-xl border-2 bg-white/50 backdrop-blur-sm px-4 py-3.5 text-sm text-gray-900 font-medium transition-all duration-300",className,
          focused || value
            ? "border-[#d4940a] bg-white shadow-[0_0_0_4px_rgba(212,148,10,0.1)]"
            : "border-gray-200 hover:border-gray-300 hover:bg-white",
        )}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          className="w-full bg-transparent outline-none placeholder-transparent"
          placeholder={label}
        />
      </div>
      <motion.label
        htmlFor={id}
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 pointer-events-none bg-white/0 px-2 font-medium",
          focused || value
            ? "top-0 left-3 -translate-y-[140%] text-xs text-[#0d1f5c] font-bold bg-white/80 backdrop-blur-sm rounded-md"
            : "text-sm",
        )}
        initial={false}
        animate={{
          scale: focused || value ? 1 : 1, // Fixed scale to rely on font-size change and position
        }}
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
