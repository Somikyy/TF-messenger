import express from 'express';
import multer from 'multer';
import userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validate,
  searchUsersSchema,
  updateUserSchema,
} from '../middleware/validation.js';
import { uploadAvatar, getAvatarUrl } from '../middleware/upload.js';
import { parseFormData } from '../middleware/parseFormData.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Поиск пользователей
router.get('/', validate(searchUsersSchema, 'query'), userController.searchUsers);

// Получение пользователя по ID
router.get('/:id', userController.getUserById);

// Обновление профиля текущего пользователя (с возможностью загрузки аватара)
router.put(
  '/me',
  (req, res, next) => {
    uploadAvatar.single('avatar')(req, res, (err) => {
      if (err) {
        // Обрабатываем ошибки multer
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: 'File too large',
              message: 'Размер файла превышает 5MB',
            });
          }
          return res.status(400).json({
            error: 'Upload error',
            message: err.message,
          });
        }
        // Обрабатываем ошибки фильтра файлов
        return res.status(400).json({
          error: 'Invalid file type',
          message: err.message || 'Неподдерживаемый тип файла',
        });
      }
      next();
    });
  },
  getAvatarUrl,
  parseFormData,
  validate(updateUserSchema),
  userController.updateUser
);

export default router;

