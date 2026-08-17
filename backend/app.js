import cors from 'cors';
import express, { static as expressStatic } from 'express';
import dotenv from 'dotenv';

// ============================================================
// MODULARIZED ROUTE IMPORTS
// Routes are organized by domain: admin, teacher, student, shared, authentication
// ============================================================

// Authentication
import authRoutes from './authentication/auth.routes.js';

// Student Module
import studentRoutes from './student/student.routes.js';
import enrollmentRoutes from './student/enrollments/studentEnrollment.routes.js';
import testRoutes from './student/tests/studentTest.routes.js';
import notesRoutes from './student/notes/studentNotes.routes.js';
import doubtRoutes from './student/doubts/studentDoubt.routes.js';
import reviewRoutes from './student/reviews/studentReview.routes.js';

// Teacher Module
import teacherRoutes from './teacher/teacher.routes.js';
import liveSessionRoutes from './teacher/livesessions/teacherLiveSession.routes.js';
import assignmentRoutes from './teacher/assignments/teacherAssignment.routes.js';

// Admin Module
import superAdminRoutes from './admin/admin.routes.js';
import parentRoutes from './admin/parents/parent.routes.js';
import classRoutes from './admin/classes/classes.routes.js';
import subjectRoutes from './admin/subjects/subject.routes.js';
import dashboardRoutes from './admin/dashboard/dashboard.routes.js';
import payoutRoutes from './admin/payouts/payout.routes.js';
import reportRoutes from './admin/reports/adminReport.routes.js';
import notificationRoutes from './admin/notifications/adminNotification.routes.js';
import subscriptionRoutes from './admin/subscription/adminSubscription.routes.js';

// Shared Modules
import courseRoutes from './shared/courses/course.routes.js';
import bannerRoutes from './shared/banners/banner.routes.js';
import contentRoutes from './shared/content/content.routes.js';
import contactUsRoutes from './shared/contactus/contactus.routes.js';
import questionRoutes from './shared/questions/question.routes.js';
import syllabusRoutes from './shared/syllabus/syllabus.routes.js';
import androidRoutes from './shared/android/android.routes.js';

// Webhook controllers
import { cashfreeWebhook } from './controllers/enrollmentController.js';
import { cashfreeSubscriptionWebhook } from './controllers/subscriptionController.js';

// Delete account page route
import deleteAccountRoutes from './routes/deleteAccount.js';

// Load env vars
dotenv.config({ override: true });   

const app = express();

// ============================================================
// CASHFREE WEBHOOKS - MUST BE BEFORE express.json() MIDDLEWARE
// This route must come FIRST to preserve raw body for signature verification
// ============================================================
app.post('/api/cashfree-webhook', express.raw({ type: 'application/json' }), cashfreeWebhook);



// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));

// Required for Private Network Access
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', expressStatic('uploads'));

// ============================================================
// API ROUTES - ORGANIZED BY DOMAIN
// ============================================================

// Authentication Module
app.use('/api/auth', authRoutes);

// Student Module
app.use('/api/students', studentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/reviews', reviewRoutes);

// Teacher Module
app.use('/api/teacher', teacherRoutes);
app.use('/api/teachers', teacherRoutes);

// Admin Module
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/reports', reportRoutes);

// Shared Modules
app.use('/api/courses', courseRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/contactus', contactUsRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/android', androidRoutes);

// Cross-Domain Routes
app.use('/api/livesessions', liveSessionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);

// Delete account page route
app.use('/page', deleteAccountRoutes);


// Health check
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});

// Express Error Handler Middleware (Catches Multer & API errors)
app.use((err, req, res, next) => {
  if (err) {
    console.error('API Error:', err.message);
    const statusCode = err.status || err.statusCode || (err.name === 'MulterError' || err.message?.includes('not supported') || err.message?.includes('Invalid file') ? 400 : 500);
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'An error occurred during processing.'
    });
  }
  next();
});

export default app;
