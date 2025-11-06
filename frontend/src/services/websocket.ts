import { io, Socket } from 'socket.io-client';
import type {
  SocketMessage,
  SocketTyping,
  SocketUserStatus,
  SocketMessageRead,
} from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Подключение к WebSocket серверу
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      // После подключения присоединяемся ко всем активным чатам
      // Это будет сделано через ChatPage useEffect
    });

    this.socket.on('authenticated', (data: { userId: string }) => {
      console.log('WebSocket authenticated:', data.userId);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });
  }

  /**
   * Отключение от WebSocket сервера
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Проверка подключения
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Присоединиться к чату
   */
  joinChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', { chatId });
      console.log(`Joining chat room: ${chatId}`);
    } else {
      console.warn('WebSocket not connected, cannot join chat');
    }
  }

  /**
   * Присоединиться ко всем чатам пользователя
   */
  joinAllChats(): void {
    if (this.socket?.connected) {
      this.socket.emit('join_all_chats');
      console.log('Joining all chats');
    } else {
      console.warn('WebSocket not connected, cannot join all chats');
    }
  }

  /**
   * Покинуть чат
   */
  leaveChat(chatId: string): void {
    this.socket?.emit('leave_chat', { chatId });
  }

  /**
   * Отправить сообщение
   */
  sendMessage(
    chatId: string,
    content: string,
    type: string = 'text',
    mediaUrl?: string
  ): void {
    this.socket?.emit('send_message', { chatId, content, type, mediaUrl });
  }

  /**
   * Уведомить о печати
   */
  typing(chatId: string, isTyping: boolean): void {
    this.socket?.emit('typing', { chatId, isTyping });
  }

  /**
   * Пометить сообщения как прочитанные
   */
  markAsRead(chatId: string, messageIds?: string[]): void {
    this.socket?.emit('mark_as_read', { chatId, messageIds });
  }

  /**
   * Подписка на событие: новое сообщение
   */
  onNewMessage(callback: (data: SocketMessage) => void): void {
    this.socket?.on('new_message', callback);
  }

  /**
   * Отписка от события: новое сообщение
   */
  offNewMessage(callback: (data: SocketMessage) => void): void {
    this.socket?.off('new_message', callback);
  }

  /**
   * Подписка на событие: пользователь печатает
   */
  onTyping(callback: (data: SocketTyping) => void): void {
    this.socket?.on('user_typing', callback);
  }

  /**
   * Отписка от события: пользователь печатает
   */
  offTyping(callback: (data: SocketTyping) => void): void {
    this.socket?.off('user_typing', callback);
  }

  /**
   * Подписка на событие: статус пользователя
   */
  onUserStatus(callback: (data: SocketUserStatus) => void): void {
    this.socket?.on('user_status', callback);
  }

  /**
   * Отписка от события: статус пользователя
   */
  offUserStatus(callback: (data: SocketUserStatus) => void): void {
    this.socket?.off('user_status', callback);
  }

  /**
   * Подписка на событие: сообщение прочитано
   */
  onMessageRead(callback: (data: SocketMessageRead) => void): void {
    this.socket?.on('message_read', callback);
  }

  /**
   * Отписка от события: сообщение прочитано
   */
  offMessageRead(callback: (data: SocketMessageRead) => void): void {
    this.socket?.off('message_read', callback);
  }

  /**
   * Подписка на событие: сообщение удалено
   */
  onMessageDeleted(callback: (data: { messageId: string; chatId: string; deletedBy: string }) => void): void {
    this.socket?.on('message_deleted', callback);
  }

  /**
   * Отписка от события: сообщение удалено
   */
  offMessageDeleted(callback: (data: { messageId: string; chatId: string; deletedBy: string }) => void): void {
    this.socket?.off('message_deleted', callback);
  }

  /**
   * Подписка на событие: аутентификация успешна
   */
  onAuthenticated(callback: (data: { userId: string }) => void): void {
    this.socket?.on('authenticated', callback);
  }

  /**
   * Отписка от события: аутентификация успешна
   */
  offAuthenticated(callback: (data: { userId: string }) => void): void {
    this.socket?.off('authenticated', callback);
  }

  /**
   * Получить socket для прямого доступа (для подписки на события подключения)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Подписка на событие: ошибка
   */
  onError(callback: (error: { message: string; code: string }) => void): void {
    this.socket?.on('error', callback);
  }

  /**
   * Отписка от события: ошибка
   */
  offError(callback: (error: { message: string; code: string }) => void): void {
    this.socket?.off('error', callback);
  }
}

export const websocketService = new WebSocketService();
export default websocketService;

