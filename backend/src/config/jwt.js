import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Генерирует JWT токен для пользователя
 * @param {Object} payload - Данные для токена (userId, email и т.д.)
 * @returns {string} JWT токен
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Верифицирует JWT токен
 * @param {string} token - JWT токен
 * @returns {Object} Декодированные данные токена
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export default {
  generateToken,
  verifyToken,
};

