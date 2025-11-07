import React, { useState } from 'react';
import { Avatar } from '../UI/Avatar';
import { VoicePlayer } from './VoicePlayer';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../i18n/context';
import { MessageContextMenu } from './MessageContextMenu';
import type { Message as MessageType } from '../../types';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const { user } = useAuthStore();
  const { t, language } = useI18n();
  const isOwn = message.senderId === user?.id;
  const [contextMenu, setContextMenu] = useState<{ position: { x: number; y: number } } | null>(null);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return `${minutes} ${t('minutesAgo')}`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ${t('hoursAgo')}`;

    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
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
            {message.type === 'audio' && message.mediaUrl ? (
              <div className="min-w-[200px]">
                <VoicePlayer
                  audioUrl={message.mediaUrl}
                  className={isOwn ? 'text-white' : ''}
                />
              </div>
            ) : message.type === 'image' && message.mediaUrl ? (
              <div className="max-w-md">
                <img
                  src={message.mediaUrl}
                  alt={message.content || t('image')}
                  className="max-w-full h-auto rounded-lg cursor-pointer"
                  onClick={() => window.open(message.mediaUrl, '_blank')}
                />
                {message.content && message.content !== t('image') && (
                  <p className="text-sm mt-2 whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}
              </div>
            ) : message.type === 'video' && message.mediaUrl ? (
              <div className="max-w-md">
                <video
                  src={message.mediaUrl}
                  controls
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '400px' }}
                >
                  {t('browserNotSupportVideo')}
                </video>
                {message.content && message.content !== t('video') && (
                  <p className="text-sm mt-2 whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}
              </div>
            ) : message.type === 'file' && message.mediaUrl ? (
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <a
                  href={message.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline hover:opacity-80 break-words"
                >
                  {message.content || t('fileDownload')}
                </a>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
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

