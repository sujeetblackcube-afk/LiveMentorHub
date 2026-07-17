import cors from 'cors';
import express, { static as expressStatic } from 'express';
import dotenv from 'dotenv';

// Route imports
import authRoutes from './routes/authRoute.js';
import studentRoutes from './routes/studentRoute.js';
import teacherRoutes from './routes/teacherRoute.js';
import parentRoutes from './routes/parentRoute.js';
import classRoutes from './routes/classRoute.js';
import subjectRoutes from './routes/subjectRoute.js';
import courseRoutes from './routes/courseRoute.js';
import enrollmentRoutes from './routes/enrollmentRoute.js';
import bannerRoutes from './routes/bannerRoute.js';
import contentRoutes from './routes/contentRoute.js';
import superAdminRoutes from './routes/superAdminRoute.js';
import coursepagedataRoutes from './androidroutes/coursepagedataRoute.js';
import homeroutes from './androidroutes/homeroutes.js';
import contactUsRoute from './routes/contactUsRoute.js';
import livesessionRoutes from './routes/livesessionRoute.js';
import notesRoutes from './routes/notesRoute.js';
import doubtRoutes from './routes/doubtRoute.js';
import assignmentRoutes from './routes/assignmentRoute.js';
import questionRoutes from './routes/questionRoute.js';
import testRoutes from './routes/testRoute.js';
import subscriptionRoutes from './routes/subscriptionRoute.js';
import payoutRoutes from './routes/payoutRoute.js';
import ReportRoute from './routes/reportRoute.js';
import notificationRoutes from './routes/notificationRoutes.js';
import teacherstudentdataRoutes from './androidroutes/teacherstudentdataRoute.js';
import syllabusRoutes from './routes/syllabusRoute.js';
import dashboardRoutes from './routes/dashboardRoute.js';

// Webhook controllers
import { cashfreeWebhook } from './controllers/enrollmentController.js';
import { cashfreeSubscriptionWebhook } from './controllers/subscriptionController.js';

// Load env vars
dotenv.config({ override: true });   

const app = express();

// ============================================================
// CASHFREE WEBHOOKS - MUST BE BEFORE express.json() MIDDLEWARE
// This route must come FIRST to preserve raw body for signature verification
app.post('/api/enrollments/cashfree-webhook', express.raw({ type: 'application/json' }), cashfreeWebhook);

// Cashfree webhook for subscriptions
app.post('/api/subscriptions/cashfree-webhook', express.raw({ type: 'application/json' }), cashfreeSubscriptionWebhook);

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/contactus', contactUsRoute);
app.use('/api/android', homeroutes);
app.use('/api/livesessions', livesessionRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/android/coursepagedata', coursepagedataRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/reports', ReportRoute);
app.use("/api/notifications", notificationRoutes);
app.use('/api/android/teacherstudentdata', teacherstudentdataRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});

export default app;
