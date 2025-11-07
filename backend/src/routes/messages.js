import express from 'express';
import messageController from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import {
  uploadAudio,
  uploadUniversal,
  getUniversalFileUrl,
} from '../middleware/upload.js';
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

// Middleware для обработки загрузки файлов (поддерживает и 'file', и 'audio' для обратной совместимости)
const handleFileUpload = (req, res, next) => {
  // Используем fields для поддержки обоих полей
  uploadUniversal.fields([
    { name: 'file', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err);
    
    // Если файл загружен через поле 'file', используем его
    if (req.files && req.files.file && req.files.file[0]) {
      req.file = req.files.file[0];
    } 
    // Если файл загружен через поле 'audio', используем его
    else if (req.files && req.files.audio && req.files.audio[0]) {
      req.file = req.files.audio[0];
    }
    
    getUniversalFileUrl(req, res, next);
  });
};

// Создание нового сообщения (с поддержкой загрузки всех типов файлов)
router.post(
  '/chats/:chatId/messages',
  handleFileUpload,
  validate(createMessageSchema),
  messageController.createMessage
);

// Пометить сообщения как прочитанные
router.put('/:id/read', messageController.markAsRead);

// Удаление сообщения
router.delete('/:id', messageController.deleteMessage);

export default router;

