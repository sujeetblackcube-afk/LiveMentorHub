import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ShoppingCart,
  Calendar,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { toast } from "react-toastify";
import { theme } from "../theme";
import { useAuth } from "../contexts/AuthContext";
import {
  getAllSubscriptions,
  createSubscriptionBuyed,
  createSubscriptionCashfreeOrder,
  getSubscriptionsByTeacherId,
} from "../services/api";

import { load } from "@cashfreepayments/cashfree-js";

export default function Subscription() {
  const { user } = useAuth();
  const teacherId = user?.teacherId;

  const [subscriptions, setSubscriptions] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingLoading, setBuyingLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [fullScreenLoading, setFullScreenLoading] = useState(false);

  // Form state for payment
  const [paymentData, setPaymentData] = useState({
    orderId: "",
    paymentStatus: "paid",
    transactionId: "",
  });

  const [cashfreeSessionId, setCashfreeSessionId] = useState(null);

  // Success popup after payment
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);

  useEffect(() => {
    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all available subscriptions
      const subscriptionsResponse = await getAllSubscriptions({
        status: "active",
      });
      setSubscriptions(subscriptionsResponse.data || []);

      // Fetch teacher's purchased subscriptions
      const mySubscriptionsResponse =
        await getSubscriptionsByTeacherId(teacherId);
      setMySubscriptions(mySubscriptionsResponse.data || []);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (subscription) => {
    setSelectedSubscription(subscription);
    setPaymentData({
      orderId: `ORD-${Date.now()}`,
      paymentStatus: "paid",
      transactionId: `TXN-${Date.now()}`,
    });
    setIsPopupOpen(true);
  };

  const handleBuySubscription = async () => {
    if (!selectedSubscription || !teacherId) {
      toast.error("Invalid subscription or teacher");
      return;
    }

    setBuyingLoading(true);
    setFullScreenLoading(true);

    try {
      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedSubscription.durationDays);

      const purchaseData = {
        planName: selectedSubscription.planName,
        price: selectedSubscription.price,
        durationDays: selectedSubscription.durationDays,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        orderId: paymentData.orderId || null,
        paymentStatus: paymentData.paymentStatus || "paid",
        transactionId: paymentData.transactionId || null,
        status: "active",
      };

      const intentRes = await createSubscriptionCashfreeOrder({
        teacherId,
        planName: selectedSubscription.planName,
        durationDays: selectedSubscription.durationDays,
        startDate: purchaseData.startDate,
        endDate: purchaseData.endDate,
        orderId: purchaseData.orderId,
      });

      if (intentRes?.success && intentRes?.payment_session_id) {
        setCashfreeSessionId(intentRes.payment_session_id);
        
        const cashfree = await load({
            mode: "production"
        });
        
        await cashfree.checkout({
            paymentSessionId: intentRes.payment_session_id,
            redirectTarget: "_self"
        });
        return;
      }
      throw new Error(
        intentRes?.message || "Failed to create subscription order",
      );
    } catch (err) {
      console.error("Failed to purchase subscription:", err);
      toast.error("Failed to purchase subscription. Please try again.");
    } finally {
      setBuyingLoading(false);
      setFullScreenLoading(false);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedSubscription(null);
    setPaymentData({
      orderId: "",
      paymentStatus: "paid",
      transactionId: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "expired":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get active plan names that teacher has bought
  const activePlanNames = mySubscriptions
    .filter((sub) => sub.status === "active")
    .map((sub) => sub.planName);

  // Filter available subscriptions (exclude already active ones that teacher has bought)
  const availableSubscriptions = subscriptions.filter(
    (sub) => !activePlanNames.includes(sub.planName),
  );

  // Check if teacher has bought all available plans
  const hasBoughtAllPlans =
    subscriptions.length > 0 && availableSubscriptions.length === 0;
  const hasActiveSubscription = mySubscriptions.some(
    (sub) => sub.status === "active",
  );

  return (
    <div
      className="p-2 sm:p-4"
      style={{ backgroundColor: theme.colors.secondary, minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1
          className="text-lg sm:text-xl font-semibold"
          style={{ color: theme.colors.textPrimary }}
        >
          Subscription Plans
        </h1>
      </div>
      {!loading && !hasActiveSubscription && (
        <div
          className="mb-6 rounded-xl p-4 sm:p-5 text-center shadow-md"
          style={{
            backgroundColor: "#FEF3C7",
            border: "1px solid #F59E0B",
          }}
        >
          <h2 className="text-lg font-semibold text-yellow-800">
            Subscription Required
          </h2>

          <p className="mt-2 text-sm sm:text-base text-yellow-700">
            Please buy any subscription plan to continue and access all
            features.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: theme.colors.primary }}
          />
          <span className="ml-2" style={{ color: theme.colors.textSecondary }}>
            Loading subscriptions...
          </span>
        </div>
      ) : (
        <>
          {/* Available Plans Section */}
          <div className="mb-8">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: theme.colors.textPrimary }}
            >
              Available Plans
            </h2>
            {availableSubscriptions.length === 0 ? (
              <div
                className="text-center py-8 rounded-lg"
                style={{ backgroundColor: theme.colors.card }}
              >
                <CreditCard
                  className="w-12 h-12 mx-auto mb-2"
                  style={{ color: theme.colors.textSecondary }}
                />
                <p style={{ color: theme.colors.textSecondary }}>
                  {hasBoughtAllPlans
                    ? "You have bought all available plans."
                    : "No subscription plans available."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="rounded-lg shadow-md overflow-hidden"
                    style={{ backgroundColor: theme.colors.card }}
                  >
                    {/* Card Header */}
                    <div
                      className="p-4"
                      style={{
                        backgroundColor: theme.colors.primary,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-white" />
                        <h3 className="text-white font-semibold text-lg">
                          {subscription.planName}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm flex items-center gap-1"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          <DollarSign className="w-4 h-4" /> Price
                        </span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          ₹{subscription.price}
                        </span>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm flex items-center gap-1"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          <Calendar className="w-4 h-4" /> Duration
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {subscription.durationDays} Days
                        </span>
                      </div>

                      {/* Courses Allowed */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm flex items-center gap-1"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          <BookOpen className="w-4 h-4" /> Courses
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {subscription.CoursesAllowed || 0}
                        </span>
                      </div>

                      {/* Buy Button */}
                      <button
                        onClick={() => handleSelectPlan(subscription)}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md transition hover:opacity-90"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Subscriptions Section */}
          <div>
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: theme.colors.textPrimary }}
            >
              My Subscriptions
            </h2>
            {mySubscriptions.length === 0 ? (
              <div
                className="text-center py-8 rounded-lg"
                style={{ backgroundColor: theme.colors.card }}
              >
                <CreditCard
                  className="w-12 h-12 mx-auto mb-2"
                  style={{ color: theme.colors.textSecondary }}
                />
                <p style={{ color: theme.colors.textSecondary }}>
                  You haven't purchased any subscriptions yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mySubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="rounded-lg shadow-md overflow-hidden"
                    style={{ backgroundColor: theme.colors.card }}
                  >
                    {/* Card Header */}
                    <div
                      className="p-4"
                      style={{
                        backgroundColor:
                          subscription.status === "active"
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-white" />
                          <h3 className="text-white font-semibold text-lg">
                            {subscription.planName}
                          </h3>
                        </div>
                        {subscription.status === "active" ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <XCircle className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          Price
                        </span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          ₹{subscription.price}
                        </span>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          Duration
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {subscription.durationDays} Days
                        </span>
                      </div>

                      {/* Start Date */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          Start Date
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {formatDate(subscription.startDate)}
                        </span>
                      </div>

                      {/* End Date */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          End Date
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {formatDate(subscription.endDate)}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          Status
                        </span>
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${getStatusColor(
                            subscription.status,
                          )}`}
                        >
                          {subscription.status === "active" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : subscription.status === "expired" ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {subscription.status.charAt(0).toUpperCase() +
                            subscription.status.slice(1)}
                        </span>
                      </div>

                      {/* Payment Status */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          Payment
                        </span>
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${getPaymentStatusColor(
                            subscription.paymentStatus,
                          )}`}
                        >
                          {subscription.paymentStatus.charAt(0).toUpperCase() +
                            subscription.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Buy Subscription Popup Modal */}
      {isPopupOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="w-full max-w-md rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
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
                Buy Subscription
              </h2>
              <button
                onClick={handleClosePopup}
                className="transition hover:opacity-80"
                style={{ color: theme.colors.textSecondary }}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
              {/* Plan Details (Read-only) */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.secondary }}
              >
                <h3
                  className="font-semibold text-lg mb-3"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Plan Details
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: theme.colors.textSecondary }}>
                      Plan Name:
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {selectedSubscription.planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.colors.textSecondary }}>
                      Price:
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      ₹{selectedSubscription.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.colors.textSecondary }}>
                      Duration:
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {selectedSubscription.durationDays} Days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.colors.textSecondary }}>
                      Courses Allowed:
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {selectedSubscription.CoursesAllowed || 0}
                    </span>
                  </div>
                </div>
              </div>

                // Payment Details (show only before Cashfree starts)
                <div>
                  <h3
                    className="font-semibold text-lg mb-3"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    Payment Details
                  </h3>
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
                  onClick={handleBuySubscription}
                  disabled={buyingLoading}
                  className="px-3 sm:px-4 py-2 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {buyingLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {buyingLoading ? "Processing..." : "Buy Now"}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup (second popup) */}
      {isSuccessPopupOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="w-full max-w-md rounded-xl shadow-xl"
            style={{
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${theme.colors.border}` }}
            >
              <h2
                className="text-base sm:text-lg font-semibold"
                style={{ color: theme.colors.textPrimary }}
              >
                Payment Successful
              </h2>
              <button
                onClick={() => {
                  setIsSuccessPopupOpen(false);
                  setSelectedSubscription(null);
                  setPaymentData({
                    orderId: "",
                    paymentStatus: "paid",
                    transactionId: "",
                  });
                  fetchData();
                }}
                className="transition hover:opacity-80"
                style={{ color: theme.colors.textSecondary }}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-7 h-7 text-green-500" />
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    Your subscription is active.
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Plan: {selectedSubscription.planName}
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.secondary }}
              >
                <div className="flex justify-between">
                  <span style={{ color: theme.colors.textSecondary }}>
                    Price
                  </span>
                  <span
                    style={{ color: theme.colors.textPrimary, fontWeight: 600 }}
                  >
                    ₹{selectedSubscription.price}
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span style={{ color: theme.colors.textSecondary }}>
                    Duration
                  </span>
                  <span
                    style={{ color: theme.colors.textPrimary, fontWeight: 600 }}
                  >
                    {selectedSubscription.durationDays} Days
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSuccessPopupOpen(false);
                  setSelectedSubscription(null);
                  setPaymentData({
                    orderId: "",
                    paymentStatus: "paid",
                    transactionId: "",
                  });
                  fetchData();
                }}
                className="w-full px-3 py-2 text-white rounded-md transition"
                style={{ backgroundColor: theme.colors.primary }}
              >
                Close
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
    </div>
  );
}
