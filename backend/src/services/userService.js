import prisma from '../config/database.js';
import { formatUser, generateUniqueTag } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Поиск пользователей
 * Поиск по: username, tagPrefix (без точек и цифр), tagSuffix (только цифры)
 */
export const searchUsers = async (searchQuery, currentUserId) => {
  try {
    const trimmedQuery = searchQuery.trim();
    
    // Очищаем запрос от @ и точек для поиска по тегам
    const cleanQuery = trimmedQuery.replace(/^@/, '').replace(/\./g, '');
    
    // Проверяем, является ли запрос только цифрами (поиск по tagSuffix)
    const isNumericSearch = /^\d+$/.test(cleanQuery);
    
    // Проверяем, содержит ли запрос только буквы (поиск по tagPrefix без точек и цифр)
    const isTagPrefixSearch = /^[a-zA-Zа-яА-ЯёЁù$éèçà]+$/.test(cleanQuery);
    
    // Формируем условия поиска
    const searchConditions = [];

    // Всегда ищем по username
    searchConditions.push({ username: { contains: trimmedQuery, mode: 'insensitive' } });

    // Если запрос только цифры - ищем по tagSuffix
    if (isNumericSearch) {
      searchConditions.push({ tagSuffix: { contains: cleanQuery } });
    }
    // Если запрос только буквы - ищем по tagPrefix
    else if (isTagPrefixSearch) {
      searchConditions.push({ tagPrefix: { contains: cleanQuery, mode: 'insensitive' } });
    }
    // Если запрос содержит и буквы и цифры - разделяем на части
    else if (cleanQuery.length > 0) {
      const numericPart = cleanQuery.match(/\d+/)?.[0];
      const textPart = cleanQuery.replace(/\d+/g, '');
      
      if (numericPart) {
        searchConditions.push({ tagSuffix: { contains: numericPart } });
      }
      if (textPart && textPart.length > 0) {
        searchConditions.push({ tagPrefix: { contains: textPart, mode: 'insensitive' } });
      }
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: searchConditions,
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

    // Форматируем пользователей без email
    return users.map(user => {
      const formatted = formatUser(user);
      // Удаляем email из результатов поиска
      delete formatted.email;
      return formatted;
    });
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
    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    // Если у пользователя нет тега, генерируем его
    if (!currentUser.tag || !currentUser.tagSuffix) {
      const { tag, tagPrefix, tagSuffix } = await generateUniqueTag(prisma);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          tag,
          tagPrefix,
          tagSuffix,
        },
      });
      
      currentUser.tag = tag;
      currentUser.tagPrefix = tagPrefix;
      currentUser.tagSuffix = tagSuffix;
    }

    // Если обновляется tagPrefix, нужно пересобрать полный тег
    const updatePayload = { ...updateData };
    
    if (updateData.tagPrefix && updateData.tagPrefix.trim() !== '') {
      const trimmedPrefix = updateData.tagPrefix.trim();
      // Проверяем, что новый тег уникален
      const newTag = `@${trimmedPrefix}.${currentUser.tagSuffix}`;
      
      // Проверяем уникальность (кроме текущего пользователя)
      const existingUser = await prisma.user.findFirst({
        where: {
          tag: newTag,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new Error('This tag is already taken');
      }

      updatePayload.tag = newTag;
      updatePayload.tagPrefix = trimmedPrefix;
    }

    // Удаляем tagSuffix из updatePayload, если он там есть (его нельзя менять)
    delete updatePayload.tagSuffix;

    // Если обновляются настройки приватности, проверяем структуру
    if (updateData.privacySettings && typeof updateData.privacySettings === 'object') {
      // Парсим текущие настройки приватности, если они есть
      let currentPrivacySettings = {};
      try {
        if (currentUser.privacySettings && typeof currentUser.privacySettings === 'object') {
          currentPrivacySettings = currentUser.privacySettings;
        }
      } catch (e) {
        logger.error('Failed to parse current privacy settings:', e);
      }

      const defaultPrivacySettings = {
        whoCanSeeMeOnline: currentPrivacySettings.whoCanSeeMeOnline || 'all',
        whoCanMessageMe: currentPrivacySettings.whoCanMessageMe || 'all',
        whoCanFindMe: currentPrivacySettings.whoCanFindMe || 'all',
        whoCanAddMeToGroups: currentPrivacySettings.whoCanAddMeToGroups || 'all',
        exceptions: currentPrivacySettings.exceptions || [],
      };

      updatePayload.privacySettings = {
        ...defaultPrivacySettings,
        ...updateData.privacySettings,
      };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
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

