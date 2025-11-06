import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../UI/Avatar';
import { Button } from '../UI/Button';
import { ProfileModal } from './ProfileModal';
import { useI18n } from '../../i18n/context';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { t } = useI18n();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  return (
    <>
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
        <h1 className="text-xl font-bold text-primary-600">Messenger</h1>
        {user && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
            >
              <Avatar
                src={user.avatar}
                name={user.displayName || user.username}
                size="sm"
                status={user.status}
              />
              <span className="text-sm font-medium text-gray-700">
                {user.displayName || user.username}
              </span>
            </button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              {t('logout')}
            </Button>
          </div>
        )}
      </header>
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};

