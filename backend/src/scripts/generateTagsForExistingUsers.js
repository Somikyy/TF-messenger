import 'dotenv/config';
import prisma from '../config/database.js';
import { generateUniqueTag } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Скрипт для генерации тегов для существующих пользователей
 */
async function generateTagsForExistingUsers() {
  try {
    logger.info('Начинаем генерацию тегов для существующих пользователей...');

    // Получаем всех пользователей без тегов
    const usersWithoutTags = await prisma.user.findMany({
      where: {
        OR: [
          { tag: null },
          { tagPrefix: null },
          { tagSuffix: null },
        ],
      },
    });

    logger.info(`Найдено ${usersWithoutTags.length} пользователей без тегов`);

    for (const user of usersWithoutTags) {
      try {
        // Генерируем уникальный тег
        const { tag, tagPrefix, tagSuffix } = await generateUniqueTag(prisma);

        // Обновляем пользователя
        await prisma.user.update({
          where: { id: user.id },
          data: {
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

        logger.info(`Тег ${tag} присвоен пользователю ${user.username}`);
      } catch (error) {
        logger.error(`Ошибка при генерации тега для пользователя ${user.username}:`, error);
      }
    }

    logger.info('Генерация тегов завершена');
  } catch (error) {
    logger.error('Ошибка при генерации тегов:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
generateTagsForExistingUsers();

