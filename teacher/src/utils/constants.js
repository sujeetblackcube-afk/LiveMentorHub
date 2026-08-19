// Application Constants
const envBase = (import.meta.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

export const API_BASE_URL = `${envBase}/api`;
export const BACKEND_BASE_URL = envBase;

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
};
