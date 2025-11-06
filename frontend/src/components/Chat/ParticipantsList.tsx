import React, { useState } from 'react';
import { Avatar } from '../UI/Avatar';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import type { Chat } from '../../types';

interface ParticipantsListProps {
  chat: Chat;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ chat }) => {
  const { kickParticipant } = useChatStore();
  const { user } = useAuthStore();
  const [kickingUserId, setKickingUserId] = useState<string | null>(null);

  const isGroupCreator = chat.type === 'group' && chat.createdBy === user?.id;

  const handleKick = async (participantId: string) => {
    if (!window.confirm('Вы уверены, что хотите исключить этого участника из группы?')) {
      return;
    }

    try {
      setKickingUserId(participantId);
      await kickParticipant(chat.id, participantId);
    } catch (error) {
      console.error('Failed to kick participant:', error);
      alert('Не удалось исключить участника');
    } finally {
      setKickingUserId(null);
    }
  };

  if (chat.type !== 'group') {
    return null;
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3">Участники ({chat.participants.length})</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {chat.participants.map((participant) => {
          const isCurrentUser = participant.userId === user?.id;
          const canKick = isGroupCreator && !isCurrentUser && participant.userId !== chat.createdBy;

          return (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar
                  src={participant.user.avatar}
                  name={participant.user.displayName || participant.user.username}
                  size="sm"
                  status={participant.user.status}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {participant.user.displayName || participant.user.username}
                    {isCurrentUser && <span className="text-gray-500 ml-1">(Вы)</span>}
                    {participant.userId === chat.createdBy && (
                      <span className="text-primary-600 ml-1 text-xs">(Создатель)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{participant.user.email}</p>
                </div>
              </div>
              {canKick && (
                <button
                  onClick={() => handleKick(participant.userId)}
                  disabled={kickingUserId === participant.userId}
                  className="ml-2 px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                >
                  {kickingUserId === participant.userId ? 'Исключение...' : 'Исключить'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

