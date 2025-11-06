import React, { useEffect } from 'react';
import { ChatList } from '../components/Chat/ChatList';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { useChatStore } from '../store/chatStore';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import websocketService from '../services/websocket';

export const ChatPage: React.FC = () => {
  const { fetchChats, chats } = useChatStore();
  const { initializeWebSocketListeners, cleanupWebSocketListeners } = useMessageStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      // Инициализируем WebSocket слушатели ПЕРЕД загрузкой чатов
      initializeWebSocketListeners();

      // Загружаем чаты (это также присоединит нас ко всем чатам)
      fetchChats().then(() => {
        // После загрузки чатов присоединяемся ко всем чатам через WebSocket
        if (websocketService.isConnected()) {
          websocketService.joinAllChats();
        }
      });
    }
  }, [isAuthenticated, fetchChats, initializeWebSocketListeners]);

  // При изменении списка чатов присоединяемся к новым чатам
  useEffect(() => {
    if (isAuthenticated && websocketService.isConnected() && chats.length > 0) {
      // Присоединяемся ко всем чатам
      chats.forEach((chat) => {
        websocketService.joinChat(chat.id);
      });
    }
  }, [chats, isAuthenticated]);

  // При переподключении WebSocket присоединяемся ко всем чатам
  useEffect(() => {
    const handleConnect = () => {
      if (isAuthenticated && chats.length > 0) {
        // Небольшая задержка, чтобы убедиться, что соединение установлено
        setTimeout(() => {
          // Присоединяемся ко всем чатам через один запрос
          websocketService.joinAllChats();
        }, 100);
      }
    };

    // Слушаем событие подключения
    const socket = websocketService.getSocket();
    if (socket) {
      socket.on('connect', handleConnect);
      return () => {
        socket.off('connect', handleConnect);
      };
    }
  }, [chats, isAuthenticated]);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      cleanupWebSocketListeners();
    };
  }, [cleanupWebSocketListeners]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-full">
      <ChatList />
      <ChatWindow />
    </div>
  );
};

