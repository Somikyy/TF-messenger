import prisma from '../config/database.js';
import { formatMessage, isChatParticipant } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Получение сообщений чата
 */
export const getChatMessages = async (chatId, userId, limit = 50, offset = 0) => {
  try {
    // Проверяем доступ к чату
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (!isChatParticipant(userId, chat.participants)) {
      throw new Error('Access denied');
    }

    // Получаем сообщения
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Переворачиваем массив, чтобы старые сообщения были первыми
    return messages.reverse().map(formatMessage);
  } catch (error) {
    logger.error('Get chat messages error:', error);
    throw error;
  }
};

/**
 * Создание нового сообщения
 */
export const createMessage = async (chatId, senderId, content, type = 'text', mediaUrl = null) => {
  try {
    // Проверяем доступ к чату
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (!isChatParticipant(senderId, chat.participants)) {
      throw new Error('Access denied');
    }

    // Создаём сообщение
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
        type,
        mediaUrl,
      },
      include: {
        sender: true,
        chat: {
          include: {
            participants: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Обновляем updatedAt чата
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        updatedAt: new Date(),
      },
    });

    return formatMessage(message);
  } catch (error) {
    logger.error('Create message error:', error);
    throw error;
  }
};

/**
 * Удаление сообщения
 */
export const deleteMessage = async (messageId, userId) => {
  try {
    // Получаем сообщение с информацией о чате
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          include: {
            participants: true,
          },
        },
        sender: true,
      },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    // Проверяем доступ к чату
    if (!isChatParticipant(userId, message.chat.participants)) {
      throw new Error('Access denied');
    }

    // Проверяем права на удаление:
    // 1. Отправитель может удалить своё сообщение
    // 2. Создатель группы может удалить любое сообщение в группе
    const isSender = message.senderId === userId;
    const isGroupCreator = message.chat.type === 'group' && message.chat.createdBy === userId;

    if (!isSender && !isGroupCreator) {
      throw new Error('Only message sender or group creator can delete messages');
    }

    // Сохраняем информацию о сообщении перед удалением
    const messageData = {
      id: message.id,
      chatId: message.chatId,
    };

    // Удаляем сообщение
    await prisma.message.delete({
      where: { id: messageId },
    });

    // Обновляем updatedAt чата
    await prisma.chat.update({
      where: { id: message.chatId },
      data: {
        updatedAt: new Date(),
      },
    });

    return { 
      message: 'Message deleted successfully',
      messageId: messageData.id,
      chatId: messageData.chatId,
    };
  } catch (error) {
    logger.error('Delete message error:', error);
    throw error;
  }
};

/**
 * Пометить сообщения как прочитанные
 */
export const markMessagesAsRead = async (chatId, userId, messageIds = null) => {
  try {
    // Проверяем доступ к чату
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (!isChatParticipant(userId, chat.participants)) {
      throw new Error('Access denied');
    }

    // Помечаем сообщения как прочитанные
    const where = {
      chatId,
      senderId: { not: userId }, // Не помечаем свои сообщения
      isRead: false,
    };

    if (messageIds && messageIds.length > 0) {
      where.id = { in: messageIds };
    }

    const result = await prisma.message.updateMany({
      where,
      data: {
        isRead: true,
      },
    });

    return {
      message: 'Messages marked as read',
      count: result.count,
    };
  } catch (error) {
    logger.error('Mark messages as read error:', error);
    throw error;
  }
};

export default {
  getChatMessages,
  createMessage,
  deleteMessage,
  markMessagesAsRead,
};

