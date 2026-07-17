import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const signJwt = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '30d' });
};

const verifyJwt = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

export { signJwt, verifyJwt };
