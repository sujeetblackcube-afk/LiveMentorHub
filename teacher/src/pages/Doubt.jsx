import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { theme } from '../theme';
import { getDoubtsByTeacherId, updateDoubt } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Search, MessageCircle, BookOpen, User, Clock, Send, X } from 'lucide-react';

const Doubt = () => {
  const [doubts, setDoubts] = useState([]);
  const [filteredDoubts, setFilteredDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchStudentId, setSearchStudentId] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDoubts();
  }, []);

  useEffect(() => {
    const filtered = doubts.filter(doubt => {
      const studentIdMatch = searchStudentId === '' || 
        (doubt.studentId && doubt.studentId.toLowerCase().includes(searchStudentId.toLowerCase()));
      return studentIdMatch;
    });
    setFilteredDoubts(filtered);
  }, [doubts, searchStudentId]);

  const fetchDoubts = async () => {
    try {
      // console.log('User object:', user);
      const teacherId = user?.teacherId;
      // console.log('Teacher ID:', teacherId);
      if (!teacherId) {
        toast.error('Teacher ID not found. Please login again.');
        return;
      }
      // console.log('Calling getDoubtsByTeacherId with:', teacherId);
      const response = await getDoubtsByTeacherId(teacherId);
      // console.log('API response:', response);
      setDoubts(response.data);
    } catch (error) {
      console.error('Error fetching doubts:', error);
      toast.error('Failed to fetch doubts');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (doubtId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    const teacherId = user?.teacherId;
    if (!teacherId) {
      toast.error('Teacher ID not found. Please login again.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDoubt(doubtId, {
        teacherId,
        answerText: replyText,
      });
      toast.success('Reply sent successfully');
      setReplyingTo(null);
      setReplyText('');
      fetchDoubts();
    } catch (error) {
      console.error('Error updating doubt:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 p-4" style={{ background: theme.colors.secondary }}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
          <div className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>Loading doubts...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.colors.secondary }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            Doubts for Your Courses
          </h1>
          <p
            className="text-lg"
            style={{ color: theme.colors.textSecondary }}
          >
            View and reply to student doubts
          </p>
        </div>

        {/* SEARCH FILTER */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search by Student ID..."
              value={searchStudentId}
              onChange={(e) => setSearchStudentId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
                boxShadow: `0 4px 6px ${theme.colors.shadow}`
              }}
              onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
              onBlur={(e) => e.target.style.borderColor = theme.colors.border}
            />
          </div>
        </div>

        {doubts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className="text-6xl mb-4"
              style={{ color: theme.colors.primary }}
            >
              ❓
            </div>
            <p
              className="text-lg font-medium"
              style={{ color: theme.colors.textSecondary }}
            >
              No doubts found for your courses
            </p>
          </div>
        ) : filteredDoubts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className="text-6xl mb-4"
              style={{ color: theme.colors.textSecondary }}
            >
              🔍
            </div>
            <p
              className="text-lg font-medium"
              style={{ color: theme.colors.textSecondary }}
            >
              No doubts found for student ID: {searchStudentId}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table
                className="min-w-full border-collapse border-2 rounded-2xl overflow-hidden"
                style={{
                  background: theme.colors.card,
                  borderColor: theme.colors.primary,
                  boxShadow: `0 8px 32px ${theme.colors.shadow}`
                }}
              >
                <thead className="sticky top-0">
                  <tr style={{ background: theme.colors.primary }}>
                    <th
                      className="px-4 py-4 text-left font-bold text-white border-r"
                      style={{ borderColor: theme.colors.primary }}
                    >
                      <div className="flex items-center">
                        <MessageCircle size={18} className="mr-2" />
                        ID
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left font-bold text-white border-r"
                      style={{ borderColor: theme.colors.primary }}
                    >
                      <div className="flex items-center">
                        <User size={18} className="mr-2" />
                        Student ID
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left font-bold text-white border-r"
                      style={{ borderColor: theme.colors.primary }}
                    >
                      <div className="flex items-center">
                        <User size={18} className="mr-2" />
                        Student Name
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left font-bold text-white border-r"
                      style={{ borderColor: theme.colors.primary }}
                    >
                      <div className="flex items-center">
                        <BookOpen size={18} className="mr-2" />
                        Course
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left font-bold text-white border-r"
                      style={{ borderColor: theme.colors.primary }}
                    >
                      <div className="flex items-center">
                        <MessageCircle size={18} className="mr-2" />
                        Doubt
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left font-bold text-white border-r"
                      style={{ borderColor: theme.colors.primary }}
                    >
                      <div className="flex items-center">
                        <MessageCircle size={18} className="mr-2" />
                        Answer
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left font-bold text-white border-r"
                      style={{ borderColor: theme.colors.primary }}
                    >
                      Status
                    </th>
                    <th
                      className="px-4 py-4 text-left font-bold text-white border-r"
                      style={{ borderColor: theme.colors.primary }}
                    >
                      <div className="flex items-center">
                        <Clock size={18} className="mr-2" />
                        Date
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 text-left font-bold text-white"
                      style={{ borderColor: theme.colors.primary }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoubts.map((doubt, index) => (
                    <tr
                      key={doubt.id}
                      className="hover:scale-[1.01] transition-all duration-300"
                      style={{
                        backgroundColor: index % 2 === 0 ? theme.colors.card : theme.colors.cardHover,
                        borderBottom: `1px solid ${theme.colors.border}`
                      }}
                    >
                      <td
                        className="px-4 py-3 font-semibold border-r text-center"
                        style={{
                          color: theme.colors.textPrimary,
                          borderColor: theme.colors.border
                        }}
                      >
                        {doubt.id}
                      </td>
                      <td
                        className="px-4 py-3 font-medium border-r"
                        style={{
                          color: theme.colors.textPrimary,
                          borderColor: theme.colors.border
                        }}
                      >
                        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: theme.colors.highlight, color: theme.colors.textPrimary }}>
                          {doubt.studentId}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 border-r"
                        style={{
                          color: theme.colors.textPrimary,
                          borderColor: theme.colors.border
                        }}
                      >
                        {doubt.studentName}
                      </td>
                      <td
                        className="px-4 py-3 border-r"
                        style={{
                          color: theme.colors.textSecondary,
                          borderColor: theme.colors.border
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium" style={{ color: theme.colors.primary }}>{doubt.courseCode}</span>
                          <span className="text-xs">{doubt.courseName}</span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 border-r"
                        style={{
                          color: theme.colors.textPrimary,
                          borderColor: theme.colors.border
                        }}
                      >
                        <div className="max-w-xs">
                          <p className="font-medium text-sm">{doubt.doubtTitle}</p>
                          <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{doubt.doubtText}</p>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 border-r"
                        style={{
                          color: theme.colors.textPrimary,
                          borderColor: theme.colors.border
                        }}
                      >
                        {doubt.answerText ? (
                          <span className="text-sm">{doubt.answerText}</span>
                        ) : (
                          <span style={{ color: theme.colors.textSecondary }}>Not answered</span>
                        )}
                      </td>
                      <td
                        className="px-4 py-3 border-r text-center"
                        style={{
                          color: theme.colors.textPrimary,
                          borderColor: theme.colors.border
                        }}
                      >
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            doubt.status === 'replied' ? 'text-white' : ''
                          }`}
                          style={{
                            backgroundColor: doubt.status === 'replied' ? theme.colors.success : theme.colors.warning,
                            color: doubt.status === 'replied' ? '#fff' : theme.colors.textPrimary
                          }}
                        >
                          {doubt.status === 'replied' ? 'Replied' : 'Pending'}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 border-r text-sm"
                        style={{
                          color: theme.colors.textSecondary,
                          borderColor: theme.colors.border
                        }}
                      >
                        {doubt.repliedAt ? new Date(doubt.repliedAt).toLocaleDateString() : '-'}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        style={{
                          color: theme.colors.textPrimary,
                          borderColor: theme.colors.border
                        }}
                      >
                        {doubt.status !== 'replied' ? (
                          <button
                            onClick={() => setReplyingTo(doubt.id)}
                            className="px-4 py-2 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
                            style={{ backgroundColor: theme.colors.primary }}
                          >
                            <Send size={16} />
                            Reply
                          </button>
                        ) : (
                          <span className="text-sm" style={{ color: theme.colors.success }}>Answered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* REPLY MODAL */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div 
            className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: theme.colors.card }}
          >
            <div 
              className="p-4 flex items-center justify-between"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <MessageCircle size={20} />
                Reply to Doubt
              </h3>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.textPrimary }}
              >
                Your Answer
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                rows={5}
                className="w-full p-4 border-2 rounded-xl outline-none focus:ring-2 resize-none"
                style={{
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.secondary
                }}
                onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                onBlur={(e) => e.target.style.borderColor = theme.colors.border}
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="px-6 py-2 rounded-xl font-semibold transition"
                  style={{ 
                    backgroundColor: theme.colors.secondary,
                    color: theme.colors.textPrimary
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReply(replyingTo)}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl text-white font-semibold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doubt;
