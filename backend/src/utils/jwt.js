import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'livementorhub_secure_jwt_secret_2026';
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET || 'livementorhub_secure_refresh_jwt_secret_2026';

/**
 * Sign Short-Lived Access Token (1 hour)
 */
export const signAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Sign Long-Lived Refresh Token (30 days)
 */
export const signRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_JWT_SECRET);
};

// Backward compatibility helper
export const signJwt = (payload) => signAccessToken(payload);
export const verifyJwt = (token) => verifyAccessToken(token);
