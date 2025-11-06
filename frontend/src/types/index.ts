// Типы для пользователя
export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

// Типы для чата
export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  createdBy?: string; // ID создателя группы (только для group чатов)
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
  messages?: Message[];
}

// Типы для участника чата
export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  joinedAt: string;
  user: User;
}

// Типы для сообщения
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

// Типы для API ответов
export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Типы для WebSocket событий
export interface SocketMessage {
  message: Message;
}

export interface SocketTyping {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export interface SocketUserStatus {
  userId: string;
  status: 'online' | 'offline' | 'away';
}

export interface SocketMessageRead {
  chatId: string;
  messageIds: string[];
  readBy: string;
}

// Типы для форм
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export interface CreateChatFormData {
  type: 'direct' | 'group';
  name?: string;
  participantIds: string[];
}

