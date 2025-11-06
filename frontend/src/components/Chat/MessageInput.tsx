import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../UI/Button';
import { useMessageStore } from '../../store/messageStore';
import { useChatStore } from '../../store/chatStore';
import websocketService from '../../services/websocket';

export const MessageInput: React.FC = () => {
  const { sendMessage } = useMessageStore();
  const { currentChat, typingUsers } = useChatStore();
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
        <Button type="submit" disabled={!content.trim()}>
          Отправить
        </Button>
      </form>
    </div>
  );
};

