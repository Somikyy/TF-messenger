import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validate,
  registerSchema,
  loginSchema,
} from '../middleware/validation.js';

const router = express.Router();

// Регистрация
router.post('/register', validate(registerSchema), authController.register);

// Вход
router.post('/login', validate(loginSchema), authController.login);

// Выход (требует аутентификации)
router.post('/logout', authenticate, authController.logout);

// Получение текущего пользователя (требует аутентификации)
router.get('/me', authenticate, authController.getMe);

export default router;

