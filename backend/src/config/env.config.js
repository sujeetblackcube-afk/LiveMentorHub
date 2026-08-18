/**
 * Environment Variables Runtime Validation
 */

import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'JWT_SECRET',
];

export const validateEnv = () => {
  const missing = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.warn(`[WARN] Missing optional/required environment variables: ${missing.join(', ')}. Using default fallbacks.`);
  }
};

export default {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'livementorhub_default_secret_key',
  DATABASE_URL: process.env.DATABASE_URL,
};
