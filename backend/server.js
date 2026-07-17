import dotenv from 'dotenv';
import cron from 'node-cron';
import app from './app.js';

import { syncModels } from './models/index.js';
import { deactivateExpiredCourses } from './controllers/courseController.js';
import { updateExpiredEnrollments } from './controllers/enrollmentController.js';
import { updateLiveSessionStatuses } from './controllers/livesessionController.js';
import { fetchLiveRates } from './utils/currencyRates.js';

// Load env vars
dotenv.config({ override: true });

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

// Live session status transitions
cron.schedule('* * * * *', async () => {
  try {
    await updateLiveSessionStatuses();
  } catch (e) {
    console.error('[Cron] LiveSession status update error:', e);
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
      console.log(`🚀 Server started successfully on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
