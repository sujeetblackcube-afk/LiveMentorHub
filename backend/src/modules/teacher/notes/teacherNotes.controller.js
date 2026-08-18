/**
 * Teacher notes controller.
 * Internal refactor only; public endpoints remain under /api/notes.
 */

import {
  addTeacherNoteService,
  deleteTeacherNoteService,
  getTeacherNotesService,
  getTeacherNoteCountService,
  updateTeacherNoteService,
  streamTeacherNoteService,
} from './teacherNotes.service.js';

export const addTeacherNote = async (req, res) => {
  try {
    const data = await addTeacherNoteService(req.body, req.file);
    return res.status(201).json({ success: true, message: 'Note added successfully', note: data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to add note' });
  }
};

export const getTeacherNotes = async (req, res) => {
  try {
    const data = await getTeacherNotesService(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to fetch notes' });
  }
};

export const updateTeacherNote = async (req, res) => {
  try {
    const data = await updateTeacherNoteService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Note updated successfully', note: data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to update note' });
  }
};

export const deleteTeacherNote = async (req, res) => {
  try {
    const data = await deleteTeacherNoteService(req.params.id);
    return res.status(200).json({ success: true, message: 'Note deleted successfully', data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to delete note' });
  }
};

export const getTeacherNoteCount = async (req, res) => {
  try {
    const data = await getTeacherNoteCountService(req.query);
    return res.status(200).json({ success: true, count: data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to count notes' });
  }
};

export const streamTeacherNote = async (req, res) => {
  try {
    const data = await streamTeacherNoteService(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to stream note' });
  }
};
