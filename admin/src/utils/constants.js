const envBase = (import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
export const API_BASE_URL = `${envBase}/api`;
export const BACKEND_BASE_URL = envBase;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  ROLE: 'role',
};
