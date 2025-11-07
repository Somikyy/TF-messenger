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

    // Определяем тип сообщения на основе загруженного файла, если тип не указан
    let messageType = type || 'text';
    let defaultContent = content || '';

    // Если есть загруженный файл, определяем тип сообщения
    if (req.file && req.file.url) {
      if (!type) {
        // Определяем тип на основе MIME типа файла
        const mimeType = req.file.mimetype;
        if (mimeType.startsWith('image/')) {
          messageType = 'image';
          defaultContent = req.file.originalname || 'Изображение';
        } else if (mimeType.startsWith('video/')) {
          messageType = 'video';
          defaultContent = req.file.originalname || 'Видео';
        } else if (mimeType.startsWith('audio/')) {
          messageType = 'audio';
          defaultContent = 'Голосовое сообщение';
        } else {
          messageType = 'file';
          defaultContent = req.file.originalname || 'Файл';
        }
      }
    }

    // Проверяем наличие файла для типов, которые требуют файл
    if (messageType === 'audio' && !req.file && !mediaUrl) {
      return res.status(400).json({
        error: 'Для голосового сообщения требуется аудио файл или mediaUrl',
      });
    }

    if (messageType === 'image' && !req.file && !mediaUrl) {
      return res.status(400).json({
        error: 'Для изображения требуется файл или mediaUrl',
      });
    }

    if (messageType === 'video' && !req.file && !mediaUrl) {
      return res.status(400).json({
        error: 'Для видео требуется файл или mediaUrl',
      });
    }

    if (messageType === 'file' && !req.file && !mediaUrl) {
      return res.status(400).json({
        error: 'Для файла требуется файл или mediaUrl',
      });
    }

    // Если есть загруженный файл, проверяем размер и используем его URL
    let finalMediaUrl = mediaUrl || null;
    if (req.file && req.file.url) {
      // Проверяем размер файла в зависимости от типа
      const fileSize = req.file.size;
      const mimeType = req.file.mimetype;
      
      if (mimeType.startsWith('image/') && fileSize > 6 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Размер изображения не должен превышать 6MB',
        });
      }
      
      if (mimeType.startsWith('video/') && fileSize > 50 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Размер видео не должен превышать 50MB',
        });
      }
      
      if (mimeType.startsWith('audio/') && fileSize > 10 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Размер аудио файла не должен превышать 10MB',
        });
      }
      
      if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/') && !mimeType.startsWith('audio/') && fileSize > 1024 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Размер файла не должен превышать 1GB',
        });
      }
      
      finalMediaUrl = req.file.url;
    }

    const message = await messageService.createMessage(
      chatId,
      senderId,
      defaultContent || content || '',
      messageType,
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

