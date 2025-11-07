import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../UI/Button';
import { VoiceRecorder } from './VoiceRecorder';
import { FileTypeModal } from './FileTypeModal';
import { useMessageStore } from '../../store/messageStore';
import { useChatStore } from '../../store/chatStore';
import { useI18n } from '../../i18n/context';
import websocketService from '../../services/websocket';
import messageService from '../../services/messageService';

export const MessageInput: React.FC = () => {
  const { sendMessage, sendVoiceMessage } = useMessageStore();
  const { currentChat, typingUsers } = useChatStore();
  const { t } = useI18n();
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showFileTypeModal, setShowFileTypeModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setUploadError(t('voiceMessageError'));
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setIsSendingVoice(false);
    }
  };

  const handleVoiceCancel = () => {
    setShowVoiceRecorder(false);
  };

  const validateFileSize = (file: File, type: 'photo' | 'video' | 'file'): string | null => {
    const maxSizes = {
      photo: 6 * 1024 * 1024, // 6MB
      video: 50 * 1024 * 1024, // 50MB
      file: 1024 * 1024 * 1024, // 1GB
    };

    if (file.size > maxSizes[type]) {
      if (type === 'photo') {
        return t('photoTooLarge');
      } else if (type === 'video') {
        return t('videoTooLarge');
      } else {
        return t('fileTooLargeError');
      }
    }
    return null;
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'photo' | 'video' | 'file'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentChat) return;

    // Валидация размера файла
    const sizeError = validateFileSize(file, type);
    if (sizeError) {
      setUploadError(sizeError);
      // Очищаем input
      if (type === 'photo' && photoInputRef.current) {
        photoInputRef.current.value = '';
      } else if (type === 'video' && videoInputRef.current) {
        videoInputRef.current.value = '';
      } else if (type === 'file' && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Скрываем ошибку через 5 секунд
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setUploadError(null);
    setIsUploadingFile(true);

    try {
      await messageService.createFileMessage(currentChat.id, file);
      // Очищаем input для возможности повторной загрузки того же файла
      if (type === 'photo' && photoInputRef.current) {
        photoInputRef.current.value = '';
      } else if (type === 'video' && videoInputRef.current) {
        videoInputRef.current.value = '';
      } else if (type === 'file' && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Ошибка при отправке файла:', error);
      setUploadError(t('uploadError'));
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleFileButtonClick = () => {
    setShowFileTypeModal(true);
  };

  const handleSelectPhoto = () => {
    photoInputRef.current?.click();
  };

  const handleSelectVideo = () => {
    videoInputRef.current?.click();
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  if (!currentChat) {
    return null;
  }

  const typingUserIds = typingUsers[currentChat.id] || new Set();
  const typingUsersList = Array.from(typingUserIds);

  return (
    <div className="border-t border-gray-200 p-4">
      {uploadError && (
        <div className="mb-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {uploadError}
        </div>
      )}
      {typingUsersList.length > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {typingUsersList.length === 1
            ? t('typing')
            : `${typingUsersList.length} ${t('typingMultiple')}`}
        </div>
      )}
      {showVoiceRecorder ? (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecordingComplete}
          onCancel={handleVoiceCancel}
        />
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={photoInputRef}
            type="file"
            onChange={(e) => handleFileSelect(e, 'photo')}
            className="hidden"
            accept="image/*"
          />
          <input
            ref={videoInputRef}
            type="file"
            onChange={(e) => handleFileSelect(e, 'video')}
            className="hidden"
            accept="video/*"
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFileSelect(e, 'file')}
            className="hidden"
          />
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder={t('enterMessage')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <Button
            type="button"
            onClick={handleFileButtonClick}
            variant="secondary"
            disabled={isSendingVoice || isUploadingFile}
            title={t('attachFile')}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </Button>
          <Button
            type="button"
            onClick={() => setShowVoiceRecorder(true)}
            variant="secondary"
            disabled={isSendingVoice || isUploadingFile}
            title={t('recordVoice')}
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
          <Button type="submit" disabled={!content.trim() || isSendingVoice || isUploadingFile}>
            {isSendingVoice || isUploadingFile ? t('sending') : t('send')}
          </Button>
        </form>
      )}
      <FileTypeModal
        isOpen={showFileTypeModal}
        onClose={() => setShowFileTypeModal(false)}
        onSelectPhoto={handleSelectPhoto}
        onSelectVideo={handleSelectVideo}
        onSelectFile={handleSelectFile}
      />
    </div>
  );
};

