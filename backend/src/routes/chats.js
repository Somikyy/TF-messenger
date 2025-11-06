import express from 'express';
import chatController from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validate,
  createChatSchema,
  addParticipantsSchema,
} from '../middleware/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получение всех чатов пользователя
router.get('/', chatController.getChats);

// Создание нового чата
router.post('/', validate(createChatSchema), chatController.createChat);

// Получение чата по ID
router.get('/:id', chatController.getChatById);

// Добавление участников в групповой чат
router.post('/:id/participants', validate(addParticipantsSchema), chatController.addParticipants);

// Удаление участника из группового чата (кик)
router.post('/:id/participants/kick', chatController.kickParticipant);

// Выход из группового чата
router.post('/:id/leave', chatController.leaveChat);

// Удаление чата (только для создателя группы)
router.delete('/:id', chatController.deleteChat);

export default router;

