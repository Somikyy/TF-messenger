import userService from '../services/userService.js';
import logger from '../utils/logger.js';

/**
 * Поиск пользователей
 */
export const searchUsers = async (req, res, next) => {
  try {
    const searchQuery = req.query.search || '';
    const currentUserId = req.user.id;

    const users = await userService.searchUsers(searchQuery, currentUserId);

    res.json({ users });
  } catch (error) {
    logger.error('Search users controller error:', error);
    next(error);
  }
};

/**
 * Получение пользователя по ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    res.json({ user });
  } catch (error) {
    logger.error('Get user by ID controller error:', error);
    next(error);
  }
};

/**
 * Обновление профиля пользователя
 */
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await userService.updateUser(userId, updateData);

    res.json({ user });
  } catch (error) {
    logger.error('Update user controller error:', error);
    next(error);
  }
};

export default {
  searchUsers,
  getUserById,
  updateUser,
};

