import authService from '../services/authService.js';
import userService from '../services/userService.js';
import logger from '../utils/logger.js';

/**
 * Регистрация нового пользователя
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const result = await authService.register(username, email, password);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Register controller error:', error);
    next(error);
  }
};

/**
 * Вход пользователя
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json(result);
  } catch (error) {
    logger.error('Login controller error:', error);
    next(error);
  }
};

/**
 * Выход пользователя (обновляем статус)
 */
export const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Обновляем статус на offline
    await userService.updateUserStatus(userId, 'offline');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout controller error:', error);
    next(error);
  }
};

/**
 * Получение текущего пользователя
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.json({ user });
  } catch (error) {
    logger.error('Get me controller error:', error);
    next(error);
  }
};

export default {
  register,
  login,
  logout,
  getMe,
};

