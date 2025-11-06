import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import messageService from '../../services/messageService';
import type { Message } from '../../types';

interface MessageContextMenuProps {
  message: Message;
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  isOpen,
  position,
  onClose,
}) => {
  const { currentChat, removeMessage } = useChatStore();
  const { user } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const isSender = message.senderId === user?.id;
  const isGroupCreator = currentChat?.type === 'group' && currentChat?.createdBy === user?.id;
  const canDelete = isSender || isGroupCreator;

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

  const handleDeleteMessage = async () => {
    if (window.confirm('Вы уверены, что хотите удалить это сообщение?')) {
      try {
        await messageService.deleteMessage(message.id);
        removeMessage(message.chatId, message.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete message:', error);
        alert('Не удалось удалить сообщение');
      }
    }
  };

  if (!isOpen || !canDelete) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <button
        onClick={handleDeleteMessage}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        Удалить сообщение
      </button>
    </div>
  );
};

