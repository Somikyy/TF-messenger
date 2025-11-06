import React, { useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStore } from '../../store/chatStore';
import { Avatar } from '../UI/Avatar';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../UI/Button';
import { AddParticipantsModal } from './AddParticipantsModal';
import { ParticipantsList } from './ParticipantsList';
import websocketService from '../../services/websocket';

export const ChatWindow: React.FC = () => {
  const { currentChat, messages, fetchMessages } = useChatStore();
  const { user } = useAuthStore();
  const [showAddParticipantsModal, setShowAddParticipantsModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // При выборе чата загружаем сообщения и присоединяемся к комнате
  useEffect(() => {
    if (currentChat && websocketService.isConnected()) {
      // Присоединяемся к комнате чата
      websocketService.joinChat(currentChat.id);
      
      // Загружаем сообщения, если их нет
      if (!messages[currentChat.id] || messages[currentChat.id].length === 0) {
        fetchMessages(currentChat.id);
      }
    }
  }, [currentChat?.id, fetchMessages, messages]);

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Выберите чат для начала общения</p>
      </div>
    );
  }

  const getChatName = () => {
    if (currentChat.type === 'group') {
      return currentChat.name || 'Групповой чат';
    }
    const otherParticipant = currentChat.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user?.displayName || otherParticipant?.user?.username || 'Пользователь';
  };

  const getChatAvatar = () => {
    if (currentChat.type === 'group') {
      return currentChat.avatar;
    }
    const otherParticipant = currentChat.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user?.avatar;
  };

  const chatMessages = messages[currentChat.id] || [];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <Avatar
          src={getChatAvatar()}
          name={getChatName()}
          size="md"
        />
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{getChatName()}</h2>
          {currentChat.type === 'direct' ? (
            <p className="text-sm text-gray-500">
              {currentChat.participants.find((p) => p.userId !== user?.id)?.user?.status === 'online'
                ? 'В сети'
                : 'Не в сети'}
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {currentChat.participants.length} участник{currentChat.participants.length !== 1 ? 'ов' : ''}
              </button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowAddParticipantsModal(true)}
                className="text-xs px-2 py-1"
              >
                + Добавить
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={chatMessages} />

      {/* Participants List (for group chats) */}
      {currentChat.type === 'group' && showParticipants && (
        <ParticipantsList chat={currentChat} />
      )}

      {/* Input */}
      <MessageInput />

      {/* Модальное окно добавления участников */}
      {currentChat.type === 'group' && (
        <AddParticipantsModal
          isOpen={showAddParticipantsModal}
          onClose={() => setShowAddParticipantsModal(false)}
          chat={currentChat}
        />
      )}
    </div>
  );
};

