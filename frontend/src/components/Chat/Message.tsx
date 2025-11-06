import React, { useState } from 'react';
import { Avatar } from '../UI/Avatar';
import { useAuthStore } from '../../store/authStore';
import { MessageContextMenu } from './MessageContextMenu';
import type { Message as MessageType } from '../../types';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const { user } = useAuthStore();
  const isOwn = message.senderId === user?.id;
  const [contextMenu, setContextMenu] = useState<{ position: { x: number; y: number } } | null>(null);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ч назад`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div
        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({
            position: { x: e.clientX, y: e.clientY },
          });
        }}
      >
        {!isOwn && (
          <Avatar
            src={message.sender?.avatar}
            name={message.sender?.displayName || message.sender?.username}
            size="sm"
            status={message.sender?.status}
          />
        )}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
          {!isOwn && (
            <span className="text-xs text-gray-500 mb-1">
              {message.sender?.displayName || message.sender?.username}
            </span>
          )}
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwn
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <span className="text-xs text-gray-400 mt-1">
            {formatTime(message.createdAt)}
            {isOwn && message.isRead && (
              <span className="ml-1">✓✓</span>
            )}
          </span>
        </div>
      </div>
      {contextMenu && (
        <MessageContextMenu
          message={message}
          isOpen={true}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

