import cors from 'cors';
import express, { static as expressStatic } from 'express';
import dotenv from 'dotenv';
import path from 'path';

import masterRouter from './routes/index.js';

dotenv.config({ override: true });

const app = express();

// Trust reverse proxy (Nginx) for rate limiting & IP detection
app.set('trust proxy', 1);

// ============================================================
// CASHFREE WEBHOOKS - MUST BE BEFORE express.json() MIDDLEWARE
// ============================================================
if (typeof cashfreeWebhook === 'function') {
  app.post('/api/cashfree-webhook', express.raw({ type: 'application/json' }), cashfreeWebhook);
}

import helmet from 'helmet';
import { apiRateLimiter } from './middleware/rateLimit.middleware.js';
import { morganMiddleware } from './utils/logger.js';

// Global Middleware & Security Headers (Helmet.js)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', expressStatic('uploads'));

// ============================================================
// MASTER API ROUTE MOUNT WITH RATE LIMITING
// ============================================================
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
