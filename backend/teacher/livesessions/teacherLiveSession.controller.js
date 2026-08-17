import {
  createLiveSession,
  startLiveSession,
  updateLiveSession,
  joinLiveSession,
  teacherCreateLiveClassTotal,
  deleteLiveSession,
} from '../../controllers/livesessionController.js';

export const createTeacherLiveSession = createLiveSession;
export const startTeacherLiveSession = startLiveSession;
export const updateTeacherLiveSession = updateLiveSession;
export const joinTeacherLiveSession = joinLiveSession;
export const getTeacherLiveClassTotal = teacherCreateLiveClassTotal;
export const deleteTeacherLiveSession = deleteLiveSession;
