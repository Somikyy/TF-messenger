import messageService from '../services/messageService.js';
import logger from '../utils/logger.js';

/**
 * Получение сообщений чата
 */
export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const messages = await messageService.getChatMessages(chatId, userId, limit, offset);

    res.json({ messages });
  } catch (error) {
    logger.error('Get messages controller error:', error);
    next(error);
  }
};

/**
 * Создание нового сообщения
 */
export const createMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content, type, mediaUrl } = req.body;
    const senderId = req.user.id;

    // Если тип audio, проверяем наличие файла или mediaUrl
    if (type === 'audio') {
      if (!req.file && !mediaUrl) {
        return res.status(400).json({
          error: 'Для голосового сообщения требуется аудио файл или mediaUrl',
        });
      }
    }

    // Если есть загруженный файл (для голосовых сообщений)
    let finalMediaUrl = mediaUrl || null;
    if (req.file && req.file.url) {
      finalMediaUrl = req.file.url;
    }

    const message = await messageService.createMessage(
      chatId,
      senderId,
      content || (type === 'audio' ? 'Голосовое сообщение' : ''),
      type || 'text',
      finalMediaUrl
    );

    // Отправляем WebSocket событие всем участникам чата
    const io = req.app.get('io');
    if (io) {
      // Отправляем всем в комнате чата
      // Это гарантирует, что все участники, которые присоединились к комнате, получат сообщение
      io.to(`chat:${chatId}`).emit('new_message', {
        message,
      });
    }

    res.status(201).json({ message });
  } catch (error) {
    logger.error('Create message controller error:', error);
    next(error);
  }
};

/**
 * Пометить сообщения как прочитанные
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { chatId, messageIds } = req.body;

    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    const result = await messageService.markMessagesAsRead(
      chatId,
      userId,
      messageIds || null
    );

    res.json(result);
  } catch (error) {
    logger.error('Mark as read controller error:', error);
    next(error);
  }
};

/**
 * Удаление сообщения
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await messageService.deleteMessage(id, userId);

    // Отправляем WebSocket событие всем участникам чата
    const io = req.app.get('io');
    if (io && result.chatId) {
      // Отправляем всем в комнате чата
      // Это гарантирует, что все участники, которые присоединились к комнате, получат уведомление об удалении
      io.to(`chat:${result.chatId}`).emit('message_deleted', {
        messageId: result.messageId,
        chatId: result.chatId,
        deletedBy: userId,
      });
    }

    res.json(result);
  } catch (error) {
    logger.error('Delete message controller error:', error);
    next(error);
  }
};

export default {
  getMessages,
  createMessage,
  deleteMessage,
  markAsRead,
};

