import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { theme } from "../theme";
import { Eye, EyeOff } from "lucide-react";

const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState("forgot"); // 'forgot', 'otp', 'reset'
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: identifier,
            role: "teacher",
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        toast.success("OTP sent to your mobile/email!");
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("An error occurred");
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/verify-forgot-password-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: identifier,
            otp: otp,
            role: "teacher",
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStep("reset");
        toast.success("OTP verified! Now set your new password.");
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier,
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

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: identifier,
            role: "teacher",
            newPassword: newPassword,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset successfully! Please login.");
        onBackToLogin();
      } else {
        toast.error(data.message || "Password reset failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Enter identifier
  if (step === "forgot") {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            Forgot Password
          </h2>
          <p
            className="text-base md:text-lg"
            style={{ color: theme.colors.textSecondary }}
          >
            Enter your email or mobile number
          </p>
        </div>

        <form onSubmit={handleSendOtp}>
          <div className="mb-4">
            <label
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Email or Mobile Number
            </label>
            <input
              type="text"
              placeholder="you@example.com or +1234567890"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
              style={{
                borderColor: theme.colors.border,
                "--tw-ring-color": theme.colors.primary,
              }}
              required
            />
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
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full mt-4 text-sm font-semibold text-[#d4940a] hover:text-[#e8a020] transition-colors cursor-pointer"
          >
            ← Back to Sign in
          </button>
        </form>
      </div>
    );
  }

  // Step 2: Verify OTP
  if (step === "otp") {
    return (
      <div className="w-full max-w-md">
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
            Enter the OTP sent to your mobile/email
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
          <div className="flex justify-between items-center mt-2 mb-3">
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
            className="w-full text-white py-2 rounded-md font-semibold transition disabled:opacity-50"
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
            onClick={() => setStep("forgot")}
            className="w-full mt-4 text-sm"
            style={{ color: theme.colors.primary }}
          >
            ← Back
          </button>
        </form>
      </div>
    );
  }

  // Step 3: Reset Password
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: theme.colors.textPrimary }}
        >
          Reset Password
        </h2>
        <p
          className="text-base md:text-lg"
          style={{ color: theme.colors.textSecondary }}
        >
          Enter your new password
        </p>
      </div>

      <form onSubmit={handleResetPassword}>
        <div className="mb-4">
          <label
            className="text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-gray-100/50"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label
            className="text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-gray-100/50"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
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
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <button
          type="button"
          onClick={() => setStep("otp")}
          className="w-full mt-4 text-sm font-semibold text-[#d4940a] hover:text-[#e8a020] transition-colors cursor-pointer"
        >
          ← Back
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
