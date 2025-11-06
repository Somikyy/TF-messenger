import { create } from 'zustand';
import type { Chat, Message } from '../types';
import chatService from '../services/chatService';
import messageService from '../services/messageService';
import websocketService from '../services/websocket';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Record<string, Message[]>; // chatId -> messages
  isLoading: boolean;
  error: string | null;
  typingUsers: Record<string, Set<string>>; // chatId -> Set of userIds
  fetchChats: () => Promise<void>;
  fetchChat: (chatId: string) => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  createChat: (type: 'direct' | 'group', participantIds: string[], name?: string) => Promise<Chat>;
  addParticipants: (chatId: string, participantIds: string[]) => Promise<void>;
  kickParticipant: (chatId: string, participantId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  leaveChat: (chatId: string) => Promise<void>;
  selectChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  markMessagesAsRead: (chatId: string, messageIds?: string[]) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: {},
  isLoading: false,
  error: null,
  typingUsers: {},

  fetchChats: async () => {
    try {
      set({ isLoading: true, error: null });
      const chats = await chatService.getChats();
      set({ chats, isLoading: false });
      
      // Присоединяемся ко всем чатам через WebSocket
      chats.forEach((chat) => {
        websocketService.joinChat(chat.id);
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message || 'Failed to fetch chats',
        isLoading: false,
      });
    }
  },

  fetchChat: async (chatId: string) => {
    try {
      set({ isLoading: true, error: null });
      const chat = await chatService.getChatById(chatId);
      set({ currentChat: chat, isLoading: false });
      
      // Присоединяемся к чату через WebSocket
      websocketService.joinChat(chatId);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message || 'Failed to fetch chat',
        isLoading: false,
      });
    }
  },

  fetchMessages: async (chatId: string) => {
    try {
      set({ isLoading: true, error: null });
      const messages = await messageService.getMessages(chatId);
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: messages,
        },
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message || 'Failed to fetch messages',
        isLoading: false,
      });
    }
  },

  createChat: async (type: 'direct' | 'group', participantIds: string[], name?: string) => {
    try {
      set({ isLoading: true, error: null });
      const chat = await chatService.createChat({ type, participantIds, name });
      
      set((state) => ({
        chats: [chat, ...state.chats],
        currentChat: chat,
        isLoading: false,
      }));

      // Присоединяемся к чату через WebSocket
      websocketService.joinChat(chat.id);

      return chat;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message || 'Failed to create chat',
        isLoading: false,
      });
      throw error;
    }
  },

  addParticipants: async (chatId: string, participantIds: string[]) => {
    try {
      set({ isLoading: true, error: null });
      const updatedChat = await chatService.addParticipants(chatId, participantIds);
      
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? updatedChat : chat
        ),
        currentChat: state.currentChat?.id === chatId ? updatedChat : state.currentChat,
        isLoading: false,
      }));

      // Присоединяем новых участников к WebSocket комнате (они присоединятся сами)
      // Но мы можем присоединиться к комнате, если это текущий чат
      if (get().currentChat?.id === chatId) {
        websocketService.joinChat(chatId);
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message || 'Failed to add participants',
        isLoading: false,
      });
      throw error;
    }
  },

  kickParticipant: async (chatId: string, participantId: string) => {
    try {
      set({ isLoading: true, error: null });
      const updatedChat = await chatService.kickParticipant(chatId, participantId);
      
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? updatedChat : chat
        ),
        currentChat: state.currentChat?.id === chatId ? updatedChat : state.currentChat,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message || 'Failed to kick participant',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      set({ isLoading: true, error: null });
      await chatService.deleteChat(chatId);
      
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== chatId),
        currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
        messages: Object.fromEntries(
          Object.entries(state.messages).filter(([id]) => id !== chatId)
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message || 'Failed to delete chat',
        isLoading: false,
      });
      throw error;
    }
  },

  leaveChat: async (chatId: string) => {
    try {
      set({ isLoading: true, error: null });
      await chatService.leaveChat(chatId);
      
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== chatId),
        currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
        messages: Object.fromEntries(
          Object.entries(state.messages).filter(([id]) => id !== chatId)
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message || 'Failed to leave chat',
        isLoading: false,
      });
      throw error;
    }
  },

  selectChat: (chatId: string) => {
    const chat = get().chats.find((c) => c.id === chatId);
    if (chat) {
      set({ currentChat: chat });
      websocketService.joinChat(chatId);
      
      // Загружаем сообщения, если их нет
      if (!get().messages[chatId]) {
        get().fetchMessages(chatId);
      }
    }
  },

  addMessage: (chatId: string, message: Message) => {
    set((state) => {
      const existingMessages = state.messages[chatId] || [];
      const messageExists = existingMessages.some((m) => m.id === message.id);
      
      if (messageExists) {
        return state;
      }

      return {
        messages: {
          ...state.messages,
          [chatId]: [...existingMessages, message],
        },
        chats: state.chats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              updatedAt: message.createdAt,
            };
          }
          return chat;
        }),
      };
    });
  },

  removeMessage: (chatId: string, messageId: string) => {
    set((state) => {
      const existingMessages = state.messages[chatId] || [];
      return {
        messages: {
          ...state.messages,
          [chatId]: existingMessages.filter((m) => m.id !== messageId),
        },
      };
    });
  },

  setTyping: (chatId: string, userId: string, isTyping: boolean) => {
    set((state) => {
      const typingUsers = { ...state.typingUsers };
      if (!typingUsers[chatId]) {
        typingUsers[chatId] = new Set();
      }

      if (isTyping) {
        typingUsers[chatId].add(userId);
      } else {
        typingUsers[chatId].delete(userId);
      }

      return { typingUsers };
    });
  },

  markMessagesAsRead: async (chatId: string, messageIds?: string[]) => {
    try {
      const messageId = messageIds?.[0] || 'temp';
      await messageService.markAsRead(messageId, chatId, messageIds);
      
      // Обновляем локальное состояние
      set((state) => {
        const messages = state.messages[chatId] || [];
        return {
          messages: {
            ...state.messages,
            [chatId]: messages.map((msg) => ({
              ...msg,
              isRead: messageIds ? messageIds.includes(msg.id) : true,
            })),
          },
        };
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

