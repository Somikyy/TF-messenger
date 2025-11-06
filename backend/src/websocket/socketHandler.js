import { Server } from 'socket.io';
import { verifyToken } from '../config/jwt.js';
import prisma from '../config/database.js';
import messageService from '../services/messageService.js';
import chatService from '../services/chatService.js';
import userService from '../services/userService.js';
import logger from '../utils/logger.js';

// Хранилище активных пользователей
const activeUsers = new Map(); // userId -> socketId

/**
 * Инициализация WebSocket handler
 */
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware для аутентификации WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.info(`User connected: ${userId}`);

    // Добавляем пользователя в активные
    activeUsers.set(userId, socket.id);
    
    // Обновляем статус пользователя на онлайн
    userService.updateUserStatus(userId, 'online').catch(err => {
      logger.error('Error updating user status:', err);
    });

    // Уведомляем других пользователей о подключении
    socket.broadcast.emit('user_status', {
      userId,
      status: 'online',
    });

    // Отправляем подтверждение аутентификации
    socket.emit('authenticated', { userId });

    // Автоматически присоединяем пользователя ко всем его чатам при подключении
    chatService.getUserChats(userId)
      .then(chats => {
        chats.forEach(chat => {
          socket.join(`chat:${chat.id}`);
        });
        logger.debug(`User ${userId} automatically joined ${chats.length} chats on connection`);
      })
      .catch(err => {
        logger.error('Error joining user chats on connection:', err);
      });

    // Обработка события: присоединиться к чату
    socket.on('join_chat', async ({ chatId }) => {
      try {
        // Проверяем доступ к чату
        const chat = await chatService.getChatById(chatId, userId);
        socket.join(`chat:${chatId}`);
        logger.debug(`User ${userId} joined chat ${chatId}`);
      } catch (error) {
        logger.error('Join chat error:', error);
        socket.emit('error', {
          message: error.message,
          code: 'JOIN_CHAT_ERROR',
        });
      }
    });

    // Автоматически присоединяем пользователя ко всем его чатам при подключении
    socket.on('join_all_chats', async () => {
      try {
        const chats = await chatService.getUserChats(userId);
        chats.forEach(chat => {
          socket.join(`chat:${chat.id}`);
        });
        logger.debug(`User ${userId} joined ${chats.length} chats`);
      } catch (error) {
        logger.error('Join all chats error:', error);
        socket.emit('error', {
          message: error.message,
          code: 'JOIN_ALL_CHATS_ERROR',
        });
      }
    });

    // Обработка события: покинуть чат
    socket.on('leave_chat', ({ chatId }) => {
      socket.leave(`chat:${chatId}`);
      logger.debug(`User ${userId} left chat ${chatId}`);
    });

    // Обработка события: отправить сообщение
    socket.on('send_message', async ({ chatId, content, type = 'text', mediaUrl = null }) => {
      try {
        // Убеждаемся, что отправитель в комнате чата
        socket.join(`chat:${chatId}`);
        
        // Создаём сообщение
        const message = await messageService.createMessage(
          chatId,
          userId,
          content,
          type,
          mediaUrl
        );

        // Получаем чат с участниками
        const chat = await chatService.getChatById(chatId, userId);

        // Отправляем сообщение всем участникам чата (включая отправителя)
        // Используем io.to() чтобы отправить всем в комнате, включая отправителя
        io.to(`chat:${chatId}`).emit('new_message', {
          message,
        });

        logger.debug(`Message sent in chat ${chatId} by user ${userId} to ${chat.participants.length} participants`);
      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', {
          message: error.message,
          code: 'SEND_MESSAGE_ERROR',
        });
      }
    });

    // Обработка события: пользователь печатает
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        chatId,
        userId,
        isTyping,
      });
    });

    // Обработка события: пометить сообщения как прочитанные
    socket.on('mark_as_read', async ({ chatId, messageIds = null }) => {
      try {
        const result = await messageService.markMessagesAsRead(chatId, userId, messageIds);

        // Уведомляем других участников чата
        socket.to(`chat:${chatId}`).emit('message_read', {
          chatId,
          messageIds: messageIds || [],
          readBy: userId,
        });

        logger.debug(`Messages marked as read in chat ${chatId} by user ${userId}`);
      } catch (error) {
        logger.error('Mark as read error:', error);
        socket.emit('error', {
          message: error.message,
          code: 'MARK_AS_READ_ERROR',
        });
      }
    });

    // Обработка отключения
    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${userId}`);
      
      // Удаляем пользователя из активных
      activeUsers.delete(userId);

      // Обновляем статус пользователя на офлайн
      try {
        await userService.updateUserStatus(userId, 'offline');
        
        // Уведомляем других пользователей об отключении
        socket.broadcast.emit('user_status', {
          userId,
          status: 'offline',
        });
      } catch (error) {
        logger.error('Error updating user status on disconnect:', error);
      }
    });
  });

  return io;
};

export default initializeSocket;

