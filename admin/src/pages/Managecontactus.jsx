import React, { useState, useEffect } from "react";
import { Search, Eye, Trash2, Mail, Phone, MessageSquare, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { theme } from "../theme";
import { getAllContacts, deleteContact, sendReply } from "../services/api";

export default function ManageContactUs() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await getAllContacts();
      setContacts(response);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
    setReplyMessage("");
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact message?")) {
      try {
        await deleteContact(contactId);
        setContacts(contacts.filter((c) => c.id !== contactId));
        toast.success("Contact message deleted successfully");
      } catch (error) {
        console.error("Failed to delete contact:", error);
        toast.error("Failed to delete contact message");
      }
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setSendingReply(true);
    try {
      await sendReply(selectedContact.id, replyMessage);

      // Update contact status to REPLIED
      setContacts(
        contacts.map((c) =>
          c.id === selectedContact.id ? { ...c, status: "REPLIED" } : c
        )
      );

      toast.success("Reply sent successfully");
      setIsModalOpen(false);
      setSelectedContact(null);
      setReplyMessage("");
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REPLIED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8" style={{ backgroundColor: theme.colors.secondary }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold" style={{ color: theme.colors.textPrimary }}>Manage Contact Us</h1>
        <span className="text-xs sm:text-sm" style={{ color: theme.colors.textSecondary }}>Dashboard Manage Contact Us</span>
      </div>

      {/* Search */}
      <div className="p-2 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-6" style={{ backgroundColor: theme.colors.card }}>
        <div className="flex gap-2 sm:gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.card,
                color: theme.colors.textPrimary,
                focusRingColor: theme.colors.primary
              }}
              placeholder="Search by name, email, or subject..."
            />
          </div>
        </div>
      </div>

      {/* Contact Messages Table */}
      <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: theme.colors.card }}>
        {loading ? (
          <div className="text-center py-8 sm:py-10">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-2" style={{ color: theme.colors.primary }} />
            <p style={{ color: theme.colors.textSecondary }}>Loading contact messages...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8 sm:py-10" style={{ color: theme.colors.textSecondary }}>
            No contact messages found.
          </div>
        ) : (
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full min-w-full">
              <thead style={{ backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }} className="border-b">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                    Contact Info
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell" style={{ color: theme.colors.textSecondary }}>
                    Role
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell" style={{ color: theme.colors.textSecondary }}>
                    Subject
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell" style={{ color: theme.colors.textSecondary }}>
                    Status
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider hidden xl:table-cell" style={{ color: theme.colors.textSecondary }}>
                    Date
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }} className="divide-y">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:opacity-80" style={{ borderColor: theme.colors.border }}>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
                          <span className="text-xs sm:text-sm font-medium text-white">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-2 sm:ml-4">
                          <div className="text-xs sm:text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                            {contact.name}
                          </div>
                          <div className="text-xs sm:text-sm" style={{ color: theme.colors.textSecondary }}>{contact.email}</div>
                          <div className="text-xs sm:text-sm sm:hidden" style={{ color: theme.colors.textSecondary }}>{contact.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 hidden sm:table-cell">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contact.role === 'student' ? 'bg-blue-100 text-blue-800' :
                          contact.role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                          contact.role === 'parent' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contact.role || 'N/A'}
                      </span>
                      {contact.specificId && (
                        <div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                          ID: {contact.specificId}
                        </div>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 hidden md:table-cell">
                      <div className="text-xs sm:text-sm" style={{ color: theme.colors.textPrimary }}>{contact.subject}</div>
                      <div className="text-xs sm:text-sm truncate max-w-xs" style={{ color: theme.colors.textSecondary }}>
                        {contact.message}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 hidden lg:table-cell">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          contact.status
                        )}`}
                      >
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 hidden xl:table-cell text-xs sm:text-sm" style={{ color: theme.colors.textSecondary }}>
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-sm font-medium">
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => handleViewContact(contact)}
                          style={{ color: theme.colors.primary }}
                          className="hover:opacity-80"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          style={{ color: theme.colors.danger }}
                          className="hover:opacity-80"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Contact Details and Reply */}
      {isModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl" style={{ backgroundColor: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
              <h2 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                Contact Details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ color: theme.colors.textSecondary }}
                className="hover:opacity-80 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                    Name
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: theme.colors.secondary }}>
                    <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{selectedContact.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                    Email
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: theme.colors.secondary }}>
                    <Mail className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                    <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{selectedContact.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                    Phone
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: theme.colors.secondary }}>
                    <Phone className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                    <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{selectedContact.phone}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                    Role
                  </label>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedContact.role === 'student' ? 'bg-blue-100 text-blue-800' :
                      selectedContact.role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                      selectedContact.role === 'parent' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedContact.role || 'N/A'}
                  </span>
                </div>
                {selectedContact.specificId && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                      Specific ID
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: theme.colors.secondary }}>
                      <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{selectedContact.specificId}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                    Status
                  </label>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      selectedContact.status
                    )}`}
                  >
                    {selectedContact.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                  Subject
                </label>
                <div className="p-2 rounded-md" style={{ backgroundColor: theme.colors.secondary }}>
                  <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{selectedContact.subject}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                  Message
                </label>
                <div className="p-3 rounded-md" style={{ backgroundColor: theme.colors.secondary, border: `1px solid ${theme.colors.border}` }}>
                  <MessageSquare className="w-4 h-4 inline mr-2" style={{ color: theme.colors.textSecondary }} />
                  <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{selectedContact.message}</span>
                </div>
              </div>

              {selectedContact.status !== "REPLIED" && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                    Reply Message
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.card,
                      color: theme.colors.textPrimary,
                      focusRingColor: theme.colors.primary
                    }}
                    placeholder="Type your reply here..."
                    rows="4"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 px-4 sm:px-6 py-4" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md transition hover:opacity-80"
                style={{
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: 'transparent'
                }}
              >
                Close
              </button>
              {selectedContact.status !== "REPLIED" && (
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply}
                  className="px-4 py-2 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {sendingReply && <Loader2 className="w-4 h-4 animate-spin" />}
                  {sendingReply ? "Sending..." : "Send Reply"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
