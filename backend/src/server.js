import dotenv from 'dotenv';
import cron from 'node-cron';
import app from './app.js';

import { syncModels } from './models/index.js';
import { fetchLiveRates } from './utils/currencyRates.js';
import { validateEnv } from './config/env.config.js';

import { deactivateExpiredCourses } from './modules/shared/courses/course.controller.js';
import { updateExpiredEnrollments } from './modules/student/enrollments/studentEnrollment.controller.js';

// Load env vars
dotenv.config({ override: true });
validateEnv();

// Cron jobs
cron.schedule('0 0 * * *', async () => {
  try {
    await deactivateExpiredCourses();
  } catch (error) {
    console.error('[Cron] Error:', error);
  }
});

cron.schedule('0 0 * * *', async () => {
  try {
    await updateExpiredEnrollments();
  } catch (error) {
    console.error('[Cron] Error:', error);
  }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await syncModels();
    console.log('✅ Database connected and models synced successfully!');
    
    await fetchLiveRates();
    console.log('✅ Live exchange rates fetched successfully!');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server started successfully on port ${PORT} (Clean Modular Architecture)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
