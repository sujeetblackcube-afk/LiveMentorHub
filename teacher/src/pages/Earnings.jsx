import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";
import { getTeacherPayoutTransactions } from "../services/api.js";
import { ArrowLeft, DollarSign, Calendar, CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function Earnings() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, transactionCount: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTeacherPayoutTransactions(statusFilter);
      if (response.status) {
        setTransactions(response.data || []);
        setSummary(response.summary || { totalAmount: 0, transactionCount: 0 });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  return (
    <main
      className="p-4 sm:p-6 min-h-screen"
      style={{ backgroundColor: theme.colors.secondary }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.primary }} />
        </button>
        <h1
          className="text-xl sm:text-2xl font-bold"
          style={{ color: theme.colors.textPrimary }}
        >
          My Earnings
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div
          className="rounded-xl p-6 shadow-sm"
          style={{ backgroundColor: theme.colors.cardBg }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: theme.colors.primary + "20" }}
            >
              <DollarSign
                className="w-5 h-5"
                style={{ color: theme.colors.primary }}
              />
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.textSecondary }}
            >
              Total Earnings
            </span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            {formatAmount(summary.totalAmount)}
          </p>
        </div>

        <div
          className="rounded-xl p-6 shadow-sm"
          style={{ backgroundColor: theme.colors.cardBg }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-2 rounded-lg bg-green-100"
            >
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.textSecondary }}
            >
              Total Transactions
            </span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            {summary.transactionCount}
          </p>
        </div>

        <div
          className="rounded-xl p-6 shadow-sm"
          style={{ backgroundColor: theme.colors.cardBg }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-2 rounded-lg bg-blue-100"
            >
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.textSecondary }}
            >
              Filter by Status
            </span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
            }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div
        className="rounded-xl shadow-sm overflow-hidden"
        style={{ backgroundColor: theme.colors.cardBg }}
      >
        <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
          <h2
            className="text-lg font-semibold"
            style={{ color: theme.colors.textPrimary }}
          >
            Transaction History
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p style={{ color: theme.colors.textSecondary }}>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p style={{ color: theme.colors.textSecondary }}>No transactions found</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: theme.colors.border }}
                >
                  <th
                    className="text-left p-4 text-sm font-medium"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Date
                  </th>
                  <th
                    className="text-left p-4 text-sm font-medium"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Amount
                  </th>
                  <th
                    className="text-left p-4 text-sm font-medium"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Payment Method
                  </th>
                  <th
                    className="text-left p-4 text-sm font-medium"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Transaction ID
                  </th>
                  <th
                    className="text-left p-4 text-sm font-medium"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction.id || index}
                    className="border-b hover:bg-gray-50"
                    style={{ borderColor: theme.colors.border }}
                  >
                    <td
                      className="p-4 text-sm"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {formatDate(transaction.requestedAt)}
                    </td>
                    <td
                      className="p-4 text-sm font-semibold"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {formatAmount(transaction.amount)}
                    </td>
                    <td
                      className="p-4 text-sm"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {transaction.paymentMethod || "-"}
                    </td>
                    <td
                      className="p-4 text-sm"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {transaction.transactionId || transaction.OrderId || "-"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusIcon(transaction.status)}
                        {transaction.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
