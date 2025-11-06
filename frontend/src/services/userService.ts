import api from './api';
import type { User } from '../types';

export const userService = {
  /**
   * Поиск пользователей
   */
  searchUsers: async (search: string): Promise<User[]> => {
    const response = await api.get<{ users: User[] }>('/users', {
      params: { search },
    });
    return response.data.users;
  },

  /**
   * Получение пользователя по ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<{ user: User }>(`/users/${id}`);
    return response.data.user;
  },

  /**
   * Обновление профиля пользователя
   */
  updateUser: async (data: Partial<User> | FormData): Promise<User> => {
    const isFormData = data instanceof FormData;
    const config = isFormData
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : {};

    const response = await api.put<{ user: User }>('/users/me', data, config);
    return response.data.user;
  },
};

export default userService;

