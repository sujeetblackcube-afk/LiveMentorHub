/**
 * Shared Routes Entry Point
 * 
 * Routes for APIs used by multiple frontends (admin, teacher, student) or general content.
 * This module consolidates routes that don't belong to a single domain.
 * 
 * Public contract endpoints:
 * /api/banners/*
 * /api/courses/*
 * /api/content/*
 * /api/syllabus/*
 * /api/questions/*
 * /api/contactus/*
 * /api/android/*
 */

import express from 'express';
import bannerRoutes from './banners/banner.routes.js';
import courseRoutes from './courses/course.routes.js';
import contentRoutes from './content/content.routes.js';
import syllabusRoutes from './syllabus/syllabus.routes.js';
import questionRoutes from './questions/question.routes.js';
import contactUsRoutes from './contactus/contactus.routes.js';
import androidRoutes from './android/android.routes.js';

const router = express.Router();

// Shared API routes
router.use('/banners', bannerRoutes);
router.use('/courses', courseRoutes);
router.use('/content', contentRoutes);
router.use('/syllabus', syllabusRoutes);
router.use('/questions', questionRoutes);
router.use('/contactus', contactUsRoutes);
router.use('/android', androidRoutes);

export default router;
