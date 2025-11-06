import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import type { Chat } from '../../types';

interface ChatContextMenuProps {
  chat: Chat;
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ChatContextMenu: React.FC<ChatContextMenuProps> = ({
  chat,
  isOpen,
  position,
  onClose,
}) => {
  const { deleteChat, leaveChat } = useChatStore();
  const { user } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const isGroupCreator = chat.type === 'group' && chat.createdBy === user?.id;
  const isGroupParticipant = chat.type === 'group' && !isGroupCreator;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleDeleteChat = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.')) {
      try {
        await deleteChat(chat.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  const handleLeaveChat = async () => {
    if (window.confirm('Вы уверены, что хотите покинуть эту группу?')) {
      try {
        await leaveChat(chat.id);
        onClose();
      } catch (error) {
        console.error('Failed to leave chat:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {isGroupCreator && (
        <button
          onClick={handleDeleteChat}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          Удалить группу
        </button>
      )}
      {isGroupParticipant && (
        <button
          onClick={handleLeaveChat}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          Покинуть группу
        </button>
      )}
    </div>
  );
};

