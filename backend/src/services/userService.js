import prisma from '../config/database.js';
import { formatUser } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Поиск пользователей
 */
export const searchUsers = async (searchQuery, currentUserId) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: searchQuery, mode: 'insensitive' } },
              { email: { contains: searchQuery, mode: 'insensitive' } },
              { displayName: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
          {
            id: { not: currentUserId }, // Исключаем текущего пользователя
          },
        ],
      },
      take: 20,
      orderBy: {
        username: 'asc',
      },
    });

    return users.map(formatUser);
  } catch (error) {
    logger.error('Search users error:', error);
    throw error;
  }
};

/**
 * Получение пользователя по ID
 */
export const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return formatUser(user);
  } catch (error) {
    logger.error('Get user by ID error:', error);
    throw error;
  }
};

/**
 * Обновление профиля пользователя
 */
export const updateUser = async (userId, updateData) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return formatUser(user);
  } catch (error) {
    logger.error('Update user error:', error);
    throw error;
  }
};

/**
 * Обновление статуса пользователя
 */
export const updateUserStatus = async (userId, status) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status,
        lastSeen: new Date(),
      },
    });

    return formatUser(user);
  } catch (error) {
    logger.error('Update user status error:', error);
    throw error;
  }
};

export default {
  searchUsers,
  getUserById,
  updateUser,
  updateUserStatus,
};

