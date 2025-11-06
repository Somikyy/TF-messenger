import prisma from '../config/database.js';
import { formatChat, isChatParticipant } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Получение всех чатов пользователя
 */
export const getUserChats = async (userId) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return chats.map(formatChat);
  } catch (error) {
    logger.error('Get user chats error:', error);
    throw error;
  }
};

/**
 * Получение чата по ID
 */
export const getChatById = async (chatId, userId) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
          include: {
            sender: true,
          },
        },
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Проверяем, является ли пользователь участником
    if (!isChatParticipant(userId, chat.participants)) {
      throw new Error('Access denied');
    }

    return formatChat(chat);
  } catch (error) {
    logger.error('Get chat by ID error:', error);
    throw error;
  }
};

/**
 * Создание нового чата
 */
export const createChat = async (type, participantIds, userId, name = null) => {
  try {
    // Для direct чата должно быть ровно 2 участника (включая создателя)
    if (type === 'direct') {
      if (participantIds.length !== 1) {
        throw new Error('Direct chat must have exactly 2 participants');
      }

      // Проверяем, не существует ли уже такой чат
      const existingChat = await prisma.chat.findFirst({
        where: {
          type: 'direct',
          participants: {
            every: {
              userId: {
                in: [userId, ...participantIds],
              },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (existingChat && existingChat.participants.length === 2) {
        return formatChat(existingChat);
      }
    }

    // Для group чата должно быть имя
    if (type === 'group' && !name) {
      throw new Error('Group chat must have a name');
    }

    // Проверяем, что все участники существуют
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: participantIds,
        },
      },
    });

    if (users.length !== participantIds.length) {
      throw new Error('Some participants not found');
    }

    // Создаём чат
    const chat = await prisma.chat.create({
      data: {
        type,
        name,
        createdBy: type === 'group' ? userId : null, // Сохраняем создателя для групповых чатов
        participants: {
          create: [
            { userId }, // Создатель
            ...participantIds.map(id => ({ userId: id })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    return formatChat(chat);
  } catch (error) {
    logger.error('Create chat error:', error);
    throw error;
  }
};

/**
 * Добавление участников в групповой чат
 */
export const addParticipants = async (chatId, userId, participantIds) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Проверяем, является ли пользователь участником
    if (!isChatParticipant(userId, chat.participants)) {
      throw new Error('Access denied');
    }

    // Проверяем, что это групповой чат
    if (chat.type !== 'group') {
      throw new Error('Can only add participants to group chats');
    }

    // Проверяем, что все участники существуют
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: participantIds,
        },
      },
    });

    if (users.length !== participantIds.length) {
      throw new Error('Some participants not found');
    }

    // Фильтруем участников, которые уже в чате
    const existingParticipantIds = chat.participants.map(p => p.userId);
    const newParticipantIds = participantIds.filter(id => !existingParticipantIds.includes(id));

    if (newParticipantIds.length === 0) {
      throw new Error('All users are already participants');
    }

    // Добавляем новых участников
    await prisma.chatParticipant.createMany({
      data: newParticipantIds.map(participantId => ({
        chatId,
        userId: participantId,
      })),
    });

    // Получаем обновлённый чат
    const updatedChat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    return formatChat(updatedChat);
  } catch (error) {
    logger.error('Add participants error:', error);
    throw error;
  }
};

/**
 * Удаление участника из группового чата (кик)
 */
export const kickParticipant = async (chatId, userId, participantIdToKick) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Проверяем, является ли пользователь участником
    if (!isChatParticipant(userId, chat.participants)) {
      throw new Error('Access denied');
    }

    // Проверяем, что это групповой чат
    if (chat.type !== 'group') {
      throw new Error('Can only kick participants from group chats');
    }

    // Проверяем, что пользователь является создателем группы
    if (chat.createdBy !== userId) {
      throw new Error('Only group creator can kick participants');
    }

    // Проверяем, что участник существует в чате
    const participant = chat.participants.find(p => p.userId === participantIdToKick);
    if (!participant) {
      throw new Error('Participant not found in chat');
    }

    // Нельзя кикнуть самого себя
    if (participantIdToKick === userId) {
      throw new Error('Cannot kick yourself');
    }

    // Удаляем участника
    await prisma.chatParticipant.delete({
      where: { id: participant.id },
    });

    // Получаем обновлённый чат
    const updatedChat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    return formatChat(updatedChat);
  } catch (error) {
    logger.error('Kick participant error:', error);
    throw error;
  }
};

/**
 * Удаление чата (только для создателя группы)
 */
export const deleteChat = async (chatId, userId) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Проверяем, является ли пользователь участником
    if (!isChatParticipant(userId, chat.participants)) {
      throw new Error('Access denied');
    }

    // Для групповых чатов только создатель может удалить
    if (chat.type === 'group' && chat.createdBy !== userId) {
      throw new Error('Only group creator can delete the group');
    }

    // Удаляем чат (каскадное удаление через Prisma)
    await prisma.chat.delete({
      where: { id: chatId },
    });

    return { message: 'Chat deleted successfully' };
  } catch (error) {
    logger.error('Delete chat error:', error);
    throw error;
  }
};

/**
 * Выход из группового чата (удаление только для себя)
 */
export const leaveChat = async (chatId, userId) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Проверяем, является ли пользователь участником
    if (!isChatParticipant(userId, chat.participants)) {
      throw new Error('Access denied');
    }

    // Проверяем, что это групповой чат
    if (chat.type !== 'group') {
      throw new Error('Can only leave group chats');
    }

    // Нельзя выйти, если ты создатель (нужно удалить группу)
    if (chat.createdBy === userId) {
      throw new Error('Group creator cannot leave. Delete the group instead.');
    }

    // Удаляем участника
    const participant = chat.participants.find(p => p.userId === userId);
    if (participant) {
      await prisma.chatParticipant.delete({
        where: { id: participant.id },
      });
    }

    return { message: 'Left chat successfully' };
  } catch (error) {
    logger.error('Leave chat error:', error);
    throw error;
  }
};

export default {
  getUserChats,
  getChatById,
  createChat,
  addParticipants,
  kickParticipant,
  deleteChat,
  leaveChat,
};

