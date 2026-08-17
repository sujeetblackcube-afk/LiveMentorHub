import NoteMedia from '../../models/NotesMedia.js';
import Course from '../../models/Course.js';
import Teacher from '../../models/Teacher.js';
import { uploadBufferToCloudinary } from '../../config/cloudinary.config.js';
import { getPaginatedData } from '../../utils/pagination.js';

export const addTeacherNoteService = async (payload, file) => {
  const { courseCode, courseType, teacherId, title, description, contentType } = payload;

  if (!courseCode || !courseType || !teacherId || !title || !contentType) {
    const error = new Error('Missing required fields: courseCode, courseType, teacherId, title, contentType');
    error.statusCode = 400;
    throw error;
  }

  if (!file) {
    const error = new Error('File upload is required');
    error.statusCode = 400;
    throw error;
  }

  const course = await Course.findOne({ where: { courseCode } });
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  const teacher = await Teacher.findOne({ where: { teacherId } });
  if (!teacher) {
    const error = new Error('Teacher not found');
    error.statusCode = 404;
    throw error;
  }

  const result = await uploadBufferToCloudinary(file.buffer, 'notes', 'auto', {
    originalname: file.originalname,
    mimetype: file.mimetype,
  });

  const created = await NoteMedia.create({
    courseName: course.courseName,
    courseCode,
    courseType,
    teacherName: teacher.name,
    teacherId,
    title,
    description,
    contentUrl: result.secure_url,
    contentType,
  });

  return created;
};

export const getTeacherNotesService = async (query) => {
  const { page, limit, courseCode, teacherId } = query;
  const where = {};

  if (courseCode) where.courseCode = courseCode;
  if (teacherId) where.teacherId = teacherId;

  const queryOptions = {
    where,
    order: [['createdAt', 'DESC']],
  };

  if (page || limit) {
    const paginatedResult = await getPaginatedData(NoteMedia, queryOptions, Number(page || 1), Number(limit || 10));
    return {
      success: true,
      data: paginatedResult.data,
      pagination: {
        totalItems: paginatedResult.totalItems,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.currentPage,
        limit: paginatedResult.limit,
      },
    };
  }

  const notes = await NoteMedia.findAll(queryOptions);
  return { success: true, data: notes };
};

export const getTeacherNoteCountService = async (query = {}) => {
  const { courseCode, teacherId } = query;
  const where = {};

  if (courseCode) where.courseCode = courseCode;
  if (teacherId) where.teacherId = teacherId;

  return NoteMedia.count({ where });
};

export const updateTeacherNoteService = async (id, payload) => {
  const note = await NoteMedia.findByPk(id);
  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  Object.assign(note, payload);
  await note.save();
  return note;
};

export const deleteTeacherNoteService = async (id) => {
  const note = await NoteMedia.findByPk(id);
  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  await note.destroy();
  return { id };
};

export const streamTeacherNoteService = async (query) => {
  const { id } = query;
  if (!id) {
    const error = new Error('Note ID is required');
    error.statusCode = 400;
    throw error;
  }

  const note = await NoteMedia.findByPk(id);
  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  return { success: true, data: note };
};
