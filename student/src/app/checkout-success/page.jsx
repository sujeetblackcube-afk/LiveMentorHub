"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { apiCall } from "@/lib/apiCall";
import { ENROLLMENT_PATHS } from "@/lib/api";
import { toast } from "react-toastify";

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!orderId || orderId === "{cfOrderId}" || orderId === "{order_id}") {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await apiCall(ENROLLMENT_PATHS.verifyCashfreeOrder(orderId), "POST");
        if (isMounted) {
          if (res?.success) {
            setSuccess(true);
            toast.success("Enrollment Verified Successfully!");
          } else {
            setSuccess(false);
            setErrorMessage(res?.message || "Payment was cancelled or failed.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setSuccess(false);
          setErrorMessage(err.message || "Payment was cancelled or failed.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
          <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your enrollment.</p>
        </div>
      </div>
    );
  }

  if (!success && (errorMessage || !orderId || orderId === "{cfOrderId}" || orderId === "{order_id}")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4">
            <AlertCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-6 text-sm">
            {errorMessage || "You cancelled the payment process. No charges were made."}
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all"
          >
            Return to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Thank you for your purchase. Your enrollment has been activated successfully.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}
