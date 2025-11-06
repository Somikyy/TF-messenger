import logger from '../utils/logger.js';
import multer from 'multer';

/**
 * Middleware для обработки ошибок
 */
export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  // Ошибка multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Размер файла превышает допустимый лимит',
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message || 'Ошибка загрузки файла',
    });
  }

  // Ошибка валидации Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  // Ошибка Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this value already exists',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not found',
      message: 'The requested record was not found',
    });
  }

  // Ошибка JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is invalid',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'The provided token has expired',
    });
  }

  // Общая ошибка сервера
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  // Логируем полную ошибку для отладки
  logger.error('Full error details:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    name: err.name,
  });

  res.status(statusCode).json({
    error: message,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err,
    }),
  });
};

/**
 * Middleware для обработки 404
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
  });
};

export default { errorHandler, notFound };

