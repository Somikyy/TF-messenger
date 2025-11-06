import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../UI/Avatar';
import { Button } from '../UI/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
      <h1 className="text-xl font-bold text-primary-600">Messenger</h1>
      {user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar
              src={user.avatar}
              name={user.displayName || user.username}
              size="sm"
              status={user.status}
            />
            <span className="text-sm font-medium text-gray-700">
              {user.displayName || user.username}
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      )}
    </header>
  );
};

