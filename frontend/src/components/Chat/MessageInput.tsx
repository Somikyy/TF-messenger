import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../UI/Button';
import { VoiceRecorder } from './VoiceRecorder';
import { useMessageStore } from '../../store/messageStore';
import { useChatStore } from '../../store/chatStore';
import websocketService from '../../services/websocket';

export const MessageInput: React.FC = () => {
  const { sendMessage, sendVoiceMessage } = useMessageStore();
  const { currentChat, typingUsers } = useChatStore();
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTyping = () => {
    if (!currentChat) return;

    if (!isTyping) {
      setIsTyping(true);
      websocketService.typing(currentChat.id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      websocketService.typing(currentChat.id, false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentChat) return;

    sendMessage(currentChat.id, content.trim());
    setContent('');

    if (isTyping) {
      setIsTyping(false);
      websocketService.typing(currentChat.id, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    if (!currentChat) return;

    setIsSendingVoice(true);
    setShowVoiceRecorder(false);

    try {
      await sendVoiceMessage(currentChat.id, audioBlob);
    } catch (error) {
      console.error('Ошибка при отправке голосового сообщения:', error);
      alert('Не удалось отправить голосовое сообщение. Попробуйте еще раз.');
    } finally {
      setIsSendingVoice(false);
    }
  };

  const handleVoiceCancel = () => {
    setShowVoiceRecorder(false);
  };

  if (!currentChat) {
    return null;
  }

  const typingUserIds = typingUsers[currentChat.id] || new Set();
  const typingUsersList = Array.from(typingUserIds);

  return (
    <div className="border-t border-gray-200 p-4">
      {typingUsersList.length > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {typingUsersList.length === 1
            ? 'Печатает...'
            : `${typingUsersList.length} пользователя печатают...`}
        </div>
      )}
      {showVoiceRecorder ? (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecordingComplete}
          onCancel={handleVoiceCancel}
        />
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <Button
            type="button"
            onClick={() => setShowVoiceRecorder(true)}
            variant="secondary"
            disabled={isSendingVoice}
            title="Записать голосовое сообщение"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
          <Button type="submit" disabled={!content.trim() || isSendingVoice}>
            {isSendingVoice ? 'Отправка...' : 'Отправить'}
          </Button>
        </form>
      )}
    </div>
  );
};

