import "./course.css";
import React from 'react';
import { FileUploadZone } from '../../components/FileUploadZone';

export const ClassCreationModal = ({ 
  isActive = false, 
  onClose, 
  sessionData = {}, 
  setSessionData, 
  setThumbnail, 
  isSubmitting = false, 
  onSubmit,
  selectedCourse,
  setSelectedCourse,
  courses = [] 
}) => {
  if (!isActive) return null;

  const safeSessionData = {
    title: sessionData?.title || '',
    description: sessionData?.description || '',
    startTime: sessionData?.startTime || '',
    endTime: sessionData?.endTime || '',
    maxParticipants: sessionData?.maxParticipants || 100,
    isPrivate: Boolean(sessionData?.isPrivate)
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Create Live Class</h2>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Course *</label>
            <select 
              value={selectedCourse?.courseCode || sessionData?.courseCode || ''} 
              onChange={(e) => {
                const c = courses.find(item => item.courseCode === e.target.value);
                setSelectedCourse?.(c || { courseCode: e.target.value, courseName: e.target.value });
                setSessionData?.({ ...sessionData, courseCode: e.target.value });
              }}
              className="w-full p-2 border rounded text-sm"
              required
              disabled={isSubmitting}
            >
              <option value="">-- Select Course --</option>
              {courses.map(c => (
                <option key={c.courseCode || c.id} value={c.courseCode}>
                  {c.courseName || c.title} ({c.courseCode})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Session Title *</label>
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
            <FileUploadZone
              label="Class Thumbnail Image"
              accept="image/*"
              onFileSelect={(f) => setThumbnail?.(f)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Start Time *</label>
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
            <label className="block text-sm font-medium mb-1">End Time *</label>
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
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Max Participants</label>
            <input
              type="number"
              value={safeSessionData.maxParticipants}
              onChange={(e) => setSessionData?.({ ...sessionData, maxParticipants: parseInt(e.target.value) || 100 })}
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={safeSessionData.isPrivate}
              onChange={(e) => setSessionData?.({ ...sessionData, isPrivate: e.target.checked })}
              disabled={isSubmitting}
            />
            <label htmlFor="isPrivate" className="text-sm font-medium">Private Session</label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-slate-50 text-sm font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassCreationModal;
