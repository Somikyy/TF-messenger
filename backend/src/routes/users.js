import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validate,
  searchUsersSchema,
  updateUserSchema,
} from '../middleware/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Поиск пользователей
router.get('/', validate(searchUsersSchema, 'query'), userController.searchUsers);

// Получение пользователя по ID
router.get('/:id', userController.getUserById);

// Обновление профиля текущего пользователя
router.put('/me', validate(updateUserSchema), userController.updateUser);

export default router;

