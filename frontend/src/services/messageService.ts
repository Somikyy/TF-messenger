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
   * Создание голосового сообщения
   */
  createVoiceMessage: async (
    chatId: string,
    audioBlob: Blob
  ): Promise<Message> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-message.webm');
    formData.append('type', 'audio');
    formData.append('content', 'Голосовое сообщение');

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const response = await fetch(
      `${API_URL}/api/messages/chats/${chatId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при отправке голосового сообщения');
    }

    const data = await response.json();
    return data.message;
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

