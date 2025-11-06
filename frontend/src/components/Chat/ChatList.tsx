import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '../UI/Avatar';
import { Button } from '../UI/Button';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import userService from '../../services/userService';
import { CreateGroupChatModal } from './CreateGroupChatModal';
import { ChatContextMenu } from './ChatContextMenu';
import type { Chat, User } from '../../types';

export const ChatList: React.FC = () => {
  const { chats, currentChat, selectChat, createChat } = useChatStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ chat: Chat; position: { x: number; y: number } } | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Групповой чат';
    }
    // Для direct чата находим другого участника
    const otherParticipant = chat.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user?.displayName || otherParticipant?.user?.username || 'Пользователь';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.avatar;
    }
    const otherParticipant = chat.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user?.avatar;
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[0];
      return lastMessage.content.length > 50
        ? `${lastMessage.content.substring(0, 50)}...`
        : lastMessage.content;
    }
    return 'Нет сообщений';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ч`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Поиск пользователей
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await userService.searchUsers(searchQuery.trim());
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Задержка 300ms для debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Создание чата с пользователем
  const handleCreateChat = async (userId: string) => {
    try {
      await createChat('direct', [userId]);
      setSearchQuery('');
      setShowSearchResults(false);
      setSearchResults([]);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  // Проверка, есть ли уже чат с пользователем
  const getExistingChat = (userId: string): Chat | undefined => {
    return chats.find((chat) => {
      if (chat.type === 'direct') {
        return chat.participants.some((p) => p.userId === userId);
      }
      return false;
    });
  };

  return (
    <>
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Чаты</h2>
            <Button
              size="sm"
              onClick={() => setShowCreateGroupModal(true)}
              title="Создать групповой чат"
              className="p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Button>
          </div>
        {/* Поиск пользователей */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowSearchResults(true);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          )}
          
          {/* Результаты поиска */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-[10] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((searchUser) => {
                const existingChat = getExistingChat(searchUser.id);
                return (
                  <button
                    key={searchUser.id}
                    onClick={() => {
                      if (existingChat) {
                        selectChat(existingChat.id);
                        setSearchQuery('');
                        setShowSearchResults(false);
                        if (searchInputRef.current) {
                          searchInputRef.current.blur();
                        }
                      } else {
                        handleCreateChat(searchUser.id);
                      }
                    }}
                    className="w-full p-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                  >
                    <Avatar
                      src={searchUser.avatar}
                      name={searchUser.displayName || searchUser.username}
                      size="md"
                      status={searchUser.status}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {searchUser.displayName || searchUser.username}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {searchUser.email}
                      </p>
                    </div>
                    {existingChat && (
                      <span className="text-xs text-primary-600">Открыть чат</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          
          {showSearchResults && searchQuery.trim().length > 0 && searchResults.length === 0 && !isSearching && (
            <div className="absolute z-[10] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
              Пользователи не найдены
            </div>
          )}
        </div>
        </div>
      
        {/* Список чатов */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
          {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Нет чатов</p>
            <p className="text-sm mt-2">Найдите пользователя выше, чтобы начать общение</p>
          </div>
        ) : (
                        chats.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => selectChat(chat.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({
                              chat,
                              position: { x: e.clientX, y: e.clientY },
                            });
                          }}
                          className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                            currentChat?.id === chat.id ? 'bg-primary-50' : ''
                          }`}
                        >
            <div className="flex gap-3">
              <Avatar
                src={getChatAvatar(chat)}
                name={getChatName(chat)}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {getChatName(chat)}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTime(chat.updatedAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {getLastMessage(chat)}
                </p>
              </div>
            </div>
          </button>
          ))
          )}
        </div>
      </div>
      
      {/* Закрытие результатов поиска при клике вне */}
      {showSearchResults && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => {
            setShowSearchResults(false);
            if (searchInputRef.current) {
              searchInputRef.current.blur();
            }
          }}
        />
      )}
      
      {/* Модальное окно создания группового чата */}
      <CreateGroupChatModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
      />

      {/* Контекстное меню для чатов */}
      {contextMenu && (
        <ChatContextMenu
          chat={contextMenu.chat}
          isOpen={true}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

