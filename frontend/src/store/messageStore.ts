import { create } from 'zustand';
import type { Message } from '../types';
import websocketService from '../services/websocket';
import { useChatStore } from './chatStore';
import { useAuthStore } from './authStore';

interface MessageState {
  sendMessage: (chatId: string, content: string) => void;
  initializeWebSocketListeners: () => void;
  cleanupWebSocketListeners: () => void;
}

// Обработчики WebSocket событий
let messageHandler: ((data: any) => void) | null = null;
let typingHandler: ((data: any) => void) | null = null;
let userStatusHandler: ((data: any) => void) | null = null;
let messageReadHandler: ((data: any) => void) | null = null;
let messageDeletedHandler: ((data: any) => void) | null = null;

export const useMessageStore = create<MessageState>(() => ({
  sendMessage: (chatId: string, content: string) => {
    const chatStore = useChatStore.getState();
    const authStore = useAuthStore.getState();
    
    if (!authStore.user) return;
    
    // Убеждаемся, что мы в комнате чата
    websocketService.joinChat(chatId);
    
    // Оптимистичное обновление - сразу показываем сообщение отправителю
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId,
      senderId: authStore.user.id,
      content,
      type: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: authStore.user,
    };
    
    // Добавляем временное сообщение
    chatStore.addMessage(chatId, optimisticMessage);
    
    // Отправляем через WebSocket
    websocketService.sendMessage(chatId, content);
  },

  initializeWebSocketListeners: () => {
    // Очищаем старые обработчики, если они есть
    if (messageHandler) {
      websocketService.offNewMessage(messageHandler);
    }
    if (typingHandler) {
      websocketService.offTyping(typingHandler);
    }
    if (userStatusHandler) {
      websocketService.offUserStatus(userStatusHandler);
    }
    if (messageReadHandler) {
      websocketService.offMessageRead(messageReadHandler);
    }
    if (messageDeletedHandler) {
      websocketService.offMessageDeleted(messageDeletedHandler);
    }
    
    // Обработчик новых сообщений
    messageHandler = (data: { message: Message }) => {
      // Получаем актуальное состояние store при каждом событии
      const chatStore = useChatStore.getState();
      const authStore = useAuthStore.getState();
      
      console.log('New message received via WebSocket:', data.message);
      
      // Проверяем, не является ли это нашим оптимистичным сообщением
      const existingMessages = chatStore.messages[data.message.chatId] || [];
      const isOptimisticMessage = existingMessages.some(
        (m) => m.id.startsWith('temp-') && m.content === data.message.content && m.senderId === authStore.user?.id
      );
      
      // Если это наше оптимистичное сообщение, заменяем его на реальное
      if (isOptimisticMessage) {
        useChatStore.setState((state) => {
          const messages = state.messages[data.message.chatId] || [];
          const filteredMessages = messages.filter((m) => !m.id.startsWith('temp-') || m.content !== data.message.content);
          
          return {
            messages: {
              ...state.messages,
              [data.message.chatId]: [...filteredMessages, data.message],
            },
          };
        });
      } else {
        // Добавляем новое сообщение (от другого пользователя или от нас, но не оптимистичное)
        // Важно: всегда добавляем сообщение, даже если оно от нас, но не оптимистичное
        // Это гарантирует синхронизацию между разными браузерами/вкладками
        chatStore.addMessage(data.message.chatId, data.message);
        
        // Дополнительно убеждаемся, что сообщение добавлено в store
        // Это важно для синхронизации между вкладками
        useChatStore.setState((state) => {
          const existingMessages = state.messages[data.message.chatId] || [];
          const messageExists = existingMessages.some((m) => m.id === data.message.id);
          
          if (messageExists) {
            return state; // Сообщение уже есть, ничего не делаем
          }
          
          // Добавляем сообщение
          return {
            messages: {
              ...state.messages,
              [data.message.chatId]: [...existingMessages, data.message],
            },
          };
        });
      }
    };
    websocketService.onNewMessage(messageHandler);

    // Обработчик печати
    typingHandler = (data: { chatId: string; userId: string; isTyping: boolean }) => {
      const authStore = useAuthStore.getState();
      const chatStore = useChatStore.getState();
      
      if (data.userId !== authStore.user?.id) {
        chatStore.setTyping(data.chatId, data.userId, data.isTyping);
      }
    };
    websocketService.onTyping(typingHandler);

    // Обработчик статуса пользователя
    userStatusHandler = (data: { userId: string; status: string }) => {
      // Обновляем статус пользователя в чатах
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) => ({
          ...chat,
          participants: chat.participants.map((participant) => {
            if (participant.user.id === data.userId) {
              return {
                ...participant,
                user: {
                  ...participant.user,
                  status: data.status as 'online' | 'offline' | 'away',
                },
              };
            }
            return participant;
          }),
        })),
      }));
    };
    websocketService.onUserStatus(userStatusHandler);

    // Обработчик прочитанных сообщений
    messageReadHandler = (data: { chatId: string; messageIds: string[] }) => {
      const chatStore = useChatStore.getState();
      chatStore.markMessagesAsRead(data.chatId, data.messageIds);
    };
    websocketService.onMessageRead(messageReadHandler);

    // Обработчик удалённых сообщений
    messageDeletedHandler = (data: { messageId: string; chatId: string; deletedBy: string }) => {
      const chatStore = useChatStore.getState();
      console.log('Message deleted via WebSocket:', data);
      chatStore.removeMessage(data.chatId, data.messageId);
    };
    websocketService.onMessageDeleted(messageDeletedHandler);
  },

  cleanupWebSocketListeners: () => {
    if (messageHandler) {
      websocketService.offNewMessage(messageHandler);
      messageHandler = null;
    }
    if (typingHandler) {
      websocketService.offTyping(typingHandler);
      typingHandler = null;
    }
    if (userStatusHandler) {
      websocketService.offUserStatus(userStatusHandler);
      userStatusHandler = null;
    }
    if (messageReadHandler) {
      websocketService.offMessageRead(messageReadHandler);
      messageReadHandler = null;
    }
    if (messageDeletedHandler) {
      websocketService.offMessageDeleted(messageDeletedHandler);
      messageDeletedHandler = null;
    }
  },
}));

