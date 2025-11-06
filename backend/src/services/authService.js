import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../config/jwt.js';
import { formatUser, generateUniqueTag } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const SALT_ROUNDS = 10;

/**
 * Регистрация нового пользователя
 */
export const register = async (username, email, password) => {
  try {
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Генерируем уникальный тег
    const { tag, tagPrefix, tagSuffix } = await generateUniqueTag(prisma);

    // Создаём пользователя
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        displayName: username,
        status: 'offline',
        tag,
        tagPrefix,
        tagSuffix,
        privacySettings: {
          whoCanSeeMeOnline: 'all',
          whoCanMessageMe: 'all',
          whoCanFindMe: 'all',
          whoCanAddMeToGroups: 'all',
          exceptions: [],
        },
        language: 'ru',
      },
    });

    // Генерируем токен
    const token = generateToken({ userId: user.id, email: user.email });

    return {
      user: formatUser(user),
      token,
    };
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

/**
 * Вход пользователя
 */
export const login = async (email, password) => {
  try {
    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Обновляем статус и lastSeen
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'online',
        lastSeen: new Date(),
      },
    });

    // Генерируем токен
    const token = generateToken({ userId: user.id, email: user.email });

    return {
      user: formatUser(updatedUser),
      token,
    };
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

/**
 * Получение текущего пользователя
 */
export const getCurrentUser = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return formatUser(user);
  } catch (error) {
    logger.error('Get current user error:', error);
    throw error;
  }
};

export default {
  register,
  login,
  getCurrentUser,
};

