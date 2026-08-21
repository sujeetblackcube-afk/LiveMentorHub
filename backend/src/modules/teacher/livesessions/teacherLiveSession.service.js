import LiveSession from '../../../models/Livesession.js';
import { getPaginatedData } from '../../../utils/pagination.js';

export const createLiveSessionService = async (sessionData) => {
  return await LiveSession.create(sessionData);
};

export const getTeacherLiveSessionsService = async (whereClause, page, limit) => {
  const queryOptions = {
    where: whereClause,
    order: [['startTime', 'DESC']],
  };

  if (page || limit) {
    return await getPaginatedData(LiveSession, queryOptions, page || 1, limit || 10);
  }

  return await LiveSession.findAll(queryOptions);
};
