import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const JWT_SECRET = process.env.JWT_SECRET || 'livementorhub_secure_jwt_secret_2026';

const signJwt = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

const verifyJwt = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export { signJwt, verifyJwt };
