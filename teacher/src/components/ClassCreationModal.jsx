import React from 'react';

export const ClassCreationModal = ({ 
  isActive = false, 
  onClose, 
  sessionData = {}, 
  setSessionData, 
  setThumbnail, 
  isSubmitting = false, 
  handleSubmitSession,
  allowCourseSelection = false,
  courses = [] // <-- Added courses prop, defaulting to empty array
}) => {
  if (!isActive) return null;

  const safeSessionData = {
    courseCode: sessionData?.courseCode || '', 
    title: sessionData?.title || '',
    description: sessionData?.description || '',
    startTime: sessionData?.startTime || '',
    endTime: sessionData?.endTime || '',
    isPrivate: sessionData?.isPrivate || false,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Schedule Live Session</h2>
        <form onSubmit={handleSubmitSession}>
          
          {/* --- DYNAMIC COURSE DROPDOWN --- */}
          {allowCourseSelection && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Course</label>
              <select
                value={safeSessionData.courseCode}
                onChange={(e) => setSessionData?.({ ...sessionData, courseCode: e.target.value })}
                className="w-full p-2 border rounded bg-white"
                required
                disabled={isSubmitting}
              >
                <option value="" disabled>Choose a course...</option>
                {courses.map((course) => (
                  <option key={course.courseCode} value={course.courseCode}>
                    {/* Adjust .courseName or .title depending on your database schema */}
                    {course.courseName || course.title || course.courseCode}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* --------------------------------- */}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={safeSessionData.title}
              onChange={(e) => setSessionData?.({ ...sessionData, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={safeSessionData.description}
              onChange={(e) => setSessionData?.({ ...sessionData, description: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail?.(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              value={safeSessionData.startTime}
              onChange={(e) => setSessionData?.({ ...sessionData, startTime: e.target.value })}
              className="w-full p-2 border rounded"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="datetime-local"
              min={safeSessionData.startTime || new Date().toISOString().slice(0, 16)}
              value={safeSessionData.endTime}
              onChange={(e) => setSessionData?.({ ...sessionData, endTime: e.target.value })}
              className="w-full p-2 border rounded"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scheduling...
                </>
              ) : (
                'Schedule'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassCreationModal;
