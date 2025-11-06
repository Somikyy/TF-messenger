import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '../UI/Avatar';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { useAuthStore } from '../../store/authStore';
import userService from '../../services/userService';
import type { PrivacySettings } from '../../types';
import { useI18n } from '../../i18n/context';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, setUser } = useAuthStore();
  const { t, setLanguage: setI18nLanguage } = useI18n();
  const [displayName, setDisplayName] = useState('');
  const [tagPrefix, setTagPrefix] = useState('');
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    whoCanSeeMeOnline: 'all',
    whoCanMessageMe: 'all',
    whoCanFindMe: 'all',
    whoCanAddMeToGroups: 'all',
    exceptions: [],
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Инициализация данных при открытии
  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(user.displayName || user.username);
      setTagPrefix(user.tagPrefix || '');
      setLanguage(user.language || 'ru');
      setPrivacySettings(
        user.privacySettings || {
          whoCanSeeMeOnline: 'all',
          whoCanMessageMe: 'all',
          whoCanFindMe: 'all',
          whoCanAddMeToGroups: 'all',
          exceptions: [],
        }
      );
      setAvatarPreview(user.avatar || null);
      setAvatarFile(null);
      setError(null);
    }
  }, [isOpen, user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        setError(t('selectImage'));
        return;
      }
      // Проверяем размер файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('fileSizeError'));
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handlePrivacyChange = (
    key: keyof PrivacySettings,
    value: string
  ) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      if (displayName !== (user.displayName || user.username)) {
        formData.append('displayName', displayName);
      }
      
      if (tagPrefix !== (user.tagPrefix || '')) {
        formData.append('tagPrefix', tagPrefix);
      }
      
      if (language !== (user.language || 'ru')) {
        formData.append('language', language);
      }
      
      const currentPrivacySettings = user.privacySettings || {
        whoCanSeeMeOnline: 'all',
        whoCanMessageMe: 'all',
        whoCanFindMe: 'all',
        whoCanAddMeToGroups: 'all',
        exceptions: [],
      };
      
      if (JSON.stringify(privacySettings) !== JSON.stringify(currentPrivacySettings)) {
        formData.append('privacySettings', JSON.stringify(privacySettings));
      }
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const updatedUser = await userService.updateUser(formData);

      setUser(updatedUser);
      // Обновляем язык интерфейса, если он изменился
      if (updatedUser.language) {
        setI18nLanguage(updatedUser.language);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const fullTag = tagPrefix
    ? `@${tagPrefix}.${user.tagSuffix || '0000'}`
    : user.tag || '';

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
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('profile')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {t('error')}: {error}
            </div>
          )}

          {/* Аватар */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar
                src={avatarPreview || undefined}
                name={user.displayName || user.username}
                size="lg"
                status={user.status}
              />
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors"
                title={t('changePhoto')}
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Никнейм */}
          <Input
            label={t('name')}
            placeholder={t('name')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          {/* Тег */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tag')}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-gray-500">@</span>
                <input
                  type="text"
                  placeholder="somikyy"
                  value={tagPrefix}
                  onChange={(e) => setTagPrefix(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-gray-500">.{user.tagSuffix || '0000'}</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {t('fullTag')}: {fullTag}
            </p>
          </div>

          {/* Настройки приватности */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">{t('privacySettings')}</h3>
            
            <div className="space-y-4">
              {/* Кто может видеть меня в сети */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('whoCanSeeMeOnline')}
                </label>
                <select
                  value={privacySettings.whoCanSeeMeOnline || 'all'}
                  onChange={(e) => handlePrivacyChange('whoCanSeeMeOnline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">{t('all')}</option>
                  <option value="none">{t('none')}</option>
                  <option value="allExcept">{t('allExcept')}</option>
                  <option value="noneExcept">{t('noneExcept')}</option>
                </select>
              </div>

              {/* Кто может мне писать первым */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('whoCanMessageMe')}
                </label>
                <select
                  value={privacySettings.whoCanMessageMe || 'all'}
                  onChange={(e) => handlePrivacyChange('whoCanMessageMe', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">{t('all')}</option>
                  <option value="none">{t('none')}</option>
                  <option value="allExcept">{t('allExcept')}</option>
                  <option value="noneExcept">{t('noneExcept')}</option>
                </select>
              </div>

              {/* Кто может находить меня через поиск */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('whoCanFindMe')}
                </label>
                <select
                  value={privacySettings.whoCanFindMe || 'all'}
                  onChange={(e) => handlePrivacyChange('whoCanFindMe', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">{t('all')}</option>
                  <option value="none">{t('none')}</option>
                  <option value="allExcept">{t('allExcept')}</option>
                  <option value="noneExcept">{t('noneExcept')}</option>
                </select>
              </div>

              {/* Кто может добавлять меня в группы */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('whoCanAddMeToGroups')}
                </label>
                <select
                  value={privacySettings.whoCanAddMeToGroups || 'all'}
                  onChange={(e) => handlePrivacyChange('whoCanAddMeToGroups', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">{t('all')}</option>
                  <option value="none">{t('none')}</option>
                  <option value="allExcept">{t('allExcept')}</option>
                  <option value="noneExcept">{t('noneExcept')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Язык интерфейса */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">{t('language')}</h3>
            <div className="flex gap-2">
              <Button
                variant={language === 'ru' ? 'primary' : 'secondary'}
                onClick={() => setLanguage('ru')}
                className="flex-1"
              >
                {t('russian')}
              </Button>
              <Button
                variant={language === 'en' ? 'primary' : 'secondary'}
                onClick={() => setLanguage('en')}
                className="flex-1"
              >
                {t('english')}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

