import chatService from '../services/chatService.js';
import logger from '../utils/logger.js';

/**
 * Получение всех чатов пользователя
 */
export const getChats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const chats = await chatService.getUserChats(userId);

    res.json({ chats });
  } catch (error) {
    logger.error('Get chats controller error:', error);
    next(error);
  }
};

/**
 * Создание нового чата
 */
export const createChat = async (req, res, next) => {
  try {
    const { type, participantIds, name } = req.body;
    const userId = req.user.id;

    const chat = await chatService.createChat(type, participantIds, userId, name);

    res.status(201).json({ chat });
  } catch (error) {
    logger.error('Create chat controller error:', error);
    next(error);
  }
};

/**
 * Получение чата по ID
 */
export const getChatById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await chatService.getChatById(id, userId);

    res.json({ chat });
  } catch (error) {
    logger.error('Get chat by ID controller error:', error);
    next(error);
  }
};

/**
 * Добавление участников в групповой чат
 */
export const addParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { participantIds } = req.body;
    const userId = req.user.id;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ error: 'participantIds is required and must be a non-empty array' });
    }

    const chat = await chatService.addParticipants(id, userId, participantIds);

    res.json({ chat });
  } catch (error) {
    logger.error('Add participants controller error:', error);
    next(error);
  }
};

/**
 * Удаление участника из группового чата (кик)
 */
export const kickParticipant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { participantId } = req.body;
    const userId = req.user.id;

    if (!participantId) {
      return res.status(400).json({ error: 'participantId is required' });
    }

    const chat = await chatService.kickParticipant(id, userId, participantId);

    res.json({ chat });
  } catch (error) {
    logger.error('Kick participant controller error:', error);
    next(error);
  }
};

/**
 * Удаление чата (только для создателя группы)
 */
export const deleteChat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await chatService.deleteChat(id, userId);

    res.json(result);
  } catch (error) {
    logger.error('Delete chat controller error:', error);
    next(error);
  }
};

/**
 * Выход из группового чата
 */
export const leaveChat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await chatService.leaveChat(id, userId);

    res.json(result);
  } catch (error) {
    logger.error('Leave chat controller error:', error);
    next(error);
  }
};

export default {
  getChats,
  createChat,
  getChatById,
  addParticipants,
  kickParticipant,
  deleteChat,
  leaveChat,
};

