import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '../UI/Avatar';
import { Button } from '../UI/Button';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import userService from '../../services/userService';
import type { User, Chat } from '../../types';

interface AddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat;
}

export const AddParticipantsModal: React.FC<AddParticipantsModalProps> = ({
  isOpen,
  onClose,
  chat,
}) => {
  const { addParticipants, isLoading } = useChatStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  // Получаем ID существующих участников
  const existingParticipantIds = chat.participants.map((p) => p.userId);

  // Поиск пользователей
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await userService.searchUsers(searchQuery.trim());
        // Исключаем уже выбранных пользователей, существующих участников и текущего пользователя
        const filteredResults = results.filter(
          (u) =>
            !selectedUsers.some((su) => su.id === u.id) &&
            !existingParticipantIds.includes(u.id) &&
            u.id !== user?.id
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedUsers, existingParticipantIds, user]);

  // Очистка при закрытии
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
    }
  }, [isOpen]);

  const handleAddUser = (userToAdd: User) => {
    if (!selectedUsers.some((u) => u.id === userToAdd.id)) {
      setSelectedUsers([...selectedUsers, userToAdd]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleAdd = async () => {
    if (selectedUsers.length === 0) {
      return;
    }

    try {
      const participantIds = selectedUsers.map((u) => u.id);
      await addParticipants(chat.id, participantIds);
      onClose();
    } catch (error) {
      console.error('Failed to add participants:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Добавить участников</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Информация о группе */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Группа: {chat.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              Участников: {chat.participants.length}
            </p>
          </div>

          {/* Поиск пользователей */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Найти пользователей
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}

              {/* Результаты поиска */}
              {searchQuery.trim().length > 0 && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((searchUser) => (
                    <button
                      key={searchUser.id}
                      onClick={() => handleAddUser(searchUser)}
                      className="w-full p-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                    >
                      <Avatar
                        src={searchUser.avatar}
                        name={searchUser.displayName || searchUser.username}
                        size="sm"
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
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.trim().length > 0 &&
                searchResults.length === 0 &&
                !isSearching && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    Пользователи не найдены или уже в группе
                  </div>
                )}
            </div>
          </div>

          {/* Выбранные пользователи */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Добавить ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((selectedUser) => (
                  <div
                    key={selectedUser.id}
                    className="flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-full"
                  >
                    <Avatar
                      src={selectedUser.avatar}
                      name={selectedUser.displayName || selectedUser.username}
                      size="sm"
                    />
                    <span className="text-sm text-gray-700">
                      {selectedUser.displayName || selectedUser.username}
                    </span>
                    <button
                      onClick={() => handleRemoveUser(selectedUser.id)}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            onClick={handleAdd}
            className="flex-1"
            disabled={selectedUsers.length === 0 || isLoading}
            isLoading={isLoading}
          >
            Добавить
          </Button>
        </div>
      </div>
    </div>
  );
};

