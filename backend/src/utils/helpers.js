/**
 * Вспомогательные функции
 */

/**
 * Форматирует пользователя для ответа (убирает пароль)
 * @param {Object} user - Объект пользователя из БД
 * @returns {Object} Пользователь без пароля
 */
export const formatUser = (user) => {
  if (!user) return null;
  
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Форматирует сообщение для ответа
 * @param {Object} message - Объект сообщения из БД
 * @returns {Object} Форматированное сообщение
 */
export const formatMessage = (message) => {
  if (!message) return null;
  
  return {
    ...message,
    sender: message.sender ? formatUser(message.sender) : null,
  };
};

/**
 * Форматирует чат для ответа
 * @param {Object} chat - Объект чата из БД
 * @returns {Object} Форматированный чат
 */
export const formatChat = (chat) => {
  if (!chat) return null;
  
  return {
    ...chat,
    participants: chat.participants?.map(p => ({
      ...p,
      user: formatUser(p.user),
    })) || [],
  };
};

/**
 * Проверяет, является ли пользователь участником чата
 * @param {string} userId - ID пользователя
 * @param {Array} participants - Массив участников чата
 * @returns {boolean}
 */
export const isChatParticipant = (userId, participants) => {
  return participants?.some(p => p.userId === userId || p.user?.id === userId) || false;
};

