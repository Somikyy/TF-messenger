import api from './api';
import type { Message } from '../types';

export const messageService = {
  /**
   * Получение сообщений чата
   */
  getMessages: async (
    chatId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> => {
    const response = await api.get<{ messages: Message[] }>(
      `/messages/chats/${chatId}/messages`,
      {
        params: { limit, offset },
      }
    );
    return response.data.messages;
  },

  /**
   * Создание нового сообщения
   */
  createMessage: async (
    chatId: string,
    content: string,
    type: string = 'text',
    mediaUrl?: string
  ): Promise<Message> => {
    const response = await api.post<{ message: Message }>(
      `/messages/chats/${chatId}/messages`,
      { content, type, mediaUrl }
    );
    return response.data.message;
  },

  /**
   * Пометить сообщения как прочитанные
   */
  markAsRead: async (
    messageId: string,
    chatId: string,
    messageIds?: string[]
  ): Promise<void> => {
    await api.put(`/messages/${messageId}/read`, { chatId, messageIds });
  },

  /**
   * Удаление сообщения
   */
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`);
  },
};

export default messageService;

