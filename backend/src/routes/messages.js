import express from 'express';
import messageController from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validate,
  createMessageSchema,
  getMessagesSchema,
} from '../middleware/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получение сообщений чата
router.get(
  '/chats/:chatId/messages',
  validate(getMessagesSchema, 'query'),
  messageController.getMessages
);

// Создание нового сообщения
router.post(
  '/chats/:chatId/messages',
  validate(createMessageSchema),
  messageController.createMessage
);

// Пометить сообщения как прочитанные
router.put('/:id/read', messageController.markAsRead);

// Удаление сообщения
router.delete('/:id', messageController.deleteMessage);

export default router;

