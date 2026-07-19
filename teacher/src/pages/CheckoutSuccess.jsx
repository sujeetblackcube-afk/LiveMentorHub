import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifySubscriptionCashfreeOrder } from "../services/api";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!orderId) {
        // If no orderId, just redirect to subscription
        navigate("/subscription", { replace: true });
        return;
      }

      try {
        const res = await verifySubscriptionCashfreeOrder(orderId);
        if (isMounted) {
          if (res?.success) {
            setSuccess(true);
            toast.success("Subscription Activated Successfully!");
            setTimeout(() => {
              // Reload page or navigate to dashboard so gate checks new active subscription
              window.location.href = "/teacher/dashboard";
            }, 2000);
          } else {
            setErrorMessage(res?.message || "Payment verification failed.");
            toast.error(res?.message || "Payment verification failed.");
          }
        }
      } catch (err) {
        console.error("Verification error:", err);
        if (isMounted) {
          setErrorMessage(err.message || "Failed to verify payment");
          toast.error("Failed to verify payment");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        {loading ? (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
            <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your subscription.</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Subscription Active!</h2>
            <p className="text-sm text-gray-600 mt-2">
              Your subscription has been activated successfully. Redirecting to dashboard...
            </p>
            <button
              onClick={() => (window.location.href = "/teacher/dashboard")}
              className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-all"
            >
              Go to Dashboard Now
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verification Issue</h2>
            <p className="text-sm text-gray-600 mt-2">{errorMessage}</p>
            <button
              onClick={() => navigate("/subscription", { replace: true })}
              className="mt-6 px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl text-sm transition-all"
            >
              Return to Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
