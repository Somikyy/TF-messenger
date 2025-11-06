import api from './api';
import type { Chat, CreateChatFormData } from '../types';

export const chatService = {
  /**
   * Получение всех чатов пользователя
   */
  getChats: async (): Promise<Chat[]> => {
    const response = await api.get<{ chats: Chat[] }>('/chats');
    return response.data.chats;
  },

  /**
   * Создание нового чата
   */
  createChat: async (data: CreateChatFormData): Promise<Chat> => {
    const response = await api.post<{ chat: Chat }>('/chats', data);
    return response.data.chat;
  },

  /**
   * Получение чата по ID
   */
  getChatById: async (id: string): Promise<Chat> => {
    const response = await api.get<{ chat: Chat }>(`/chats/${id}`);
    return response.data.chat;
  },

  /**
   * Добавление участников в групповой чат
   */
  addParticipants: async (chatId: string, participantIds: string[]): Promise<Chat> => {
    const response = await api.post<{ chat: Chat }>(`/chats/${chatId}/participants`, {
      participantIds,
    });
    return response.data.chat;
  },

  /**
   * Удаление участника из группового чата (кик)
   */
  kickParticipant: async (chatId: string, participantId: string): Promise<Chat> => {
    const response = await api.post<{ chat: Chat }>(`/chats/${chatId}/participants/kick`, {
      participantId,
    });
    return response.data.chat;
  },

  /**
   * Удаление чата (только для создателя группы)
   */
  deleteChat: async (id: string): Promise<void> => {
    await api.delete(`/chats/${id}`);
  },

  /**
   * Выход из группового чата
   */
  leaveChat: async (id: string): Promise<void> => {
    await api.post(`/chats/${id}/leave`);
  },
};

export default chatService;

