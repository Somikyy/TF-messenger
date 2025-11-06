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

/**
 * Генерирует уникальный тег для пользователя
 * Формат: @prefix.suffix где prefix - случайное слово, suffix - 4 цифры
 * @param {Object} prisma - Экземпляр Prisma Client
 * @returns {Promise<{tag: string, tagPrefix: string, tagSuffix: string}>}
 */
export const generateUniqueTag = async (prisma) => {
  const prefixes = ['somikyy', 'network', 'kyynet', 'tfmsg', 'tf'];
  const specialChars = ['ù', '$', 'é', 'è', 'ç', 'à'];
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    // Выбираем случайный префикс
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    // Добавляем случайный специальный символ (50% вероятность)
    const prefix = Math.random() > 0.5 
      ? randomPrefix + specialChars[Math.floor(Math.random() * specialChars.length)]
      : randomPrefix;
    
    // Генерируем 4 случайные цифры (0000-9999)
    const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    const fullTag = `@${prefix}.${suffix}`;
    
    // Проверяем уникальность
    const existingUser = await prisma.user.findFirst({
      where: { tag: fullTag },
    });
    
    if (!existingUser) {
      return {
        tag: fullTag,
        tagPrefix: prefix,
        tagSuffix: suffix,
      };
    }
    
    attempts++;
  }
  
  // Если не удалось сгенерировать уникальный тег за 100 попыток, используем timestamp
  const timestamp = Date.now().toString().slice(-4);
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const prefix = randomPrefix + specialChars[Math.floor(Math.random() * specialChars.length)];
  const suffix = timestamp;
  
  return {
    tag: `@${prefix}.${suffix}`,
    tagPrefix: prefix,
    tagSuffix: suffix,
  };
};

