import cors from 'cors';
import express, { static as expressStatic } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';

import masterRouter from './routes/index.js';
import { cashfreeWebhook } from './modules/student/enrollments/studentEnrollment.controller.js';
import { apiRateLimiter } from './middleware/rateLimit.middleware.js';
import { morganMiddleware } from './utils/logger.js';

dotenv.config({ override: true });

const app = express();

// Trust reverse proxy (Nginx) for rate limiting & IP detection
app.set('trust proxy', 1);

// ============================================================
// CASHFREE WEBHOOKS - MUST BE BEFORE express.json() MIDDLEWARE
// ============================================================
const webhookRawParser = express.raw({ type: '*/*' });
app.post(['/api/cashfree-webhook', '/api/api/cashfree-webhook', '/cashfree-webhook'], webhookRawParser, cashfreeWebhook);

// Global Middleware & Security Headers (Helmet.js)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with fallback for missing uploaded images
app.use('/uploads', expressStatic('uploads'), (req, res) => {
  if (req.path.includes('profile') || req.path.endsWith('.jpg') || req.path.endsWith('.png')) {
    return res.redirect('https://res.cloudinary.com/tivvs1hg/image/upload/v1784374645/courses/ziqtvx77up8xnwowulfy.jpg');
  }
  res.status(404).send('File not found');
});

app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace('/api/api/', '/api/');
  } else if (!req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/uploads')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  next();
});

// Master API route mount
app.use('/api', apiRateLimiter, masterRouter);

// Root Health Check
app.get('/', (req, res) => {
  res.send('LiveMentorHub Backend Server Running ✅');
});

// Express Error Handler Middleware
app.use((err, req, res, next) => {
  if (err) {
    console.error('API Error:', err.message);
    const statusCode = err.status || err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      status: false,
      message: err.message || 'An error occurred during request processing.'
    });
  }
  next();
});

export default app;
