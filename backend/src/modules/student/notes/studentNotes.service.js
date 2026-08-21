import NotesMedia from '../../../models/NotesMedia.js';
import { getPaginatedData } from '../../../utils/pagination.js';

export const fetchStudentNotesService = async (whereClause, page, limit) => {
  const queryOptions = {
    where: whereClause,
    order: [['createdAt', 'DESC']],
  };

  if (page || limit) {
    return await getPaginatedData(NotesMedia, queryOptions, page || 1, limit || 10);
  }

  return await NotesMedia.findAll(queryOptions);
};
