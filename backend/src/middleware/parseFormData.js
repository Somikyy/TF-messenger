/**
 * Middleware для парсинга FormData перед валидацией
 * Преобразует строковые значения в нужные типы
 */
export const parseFormData = (req, res, next) => {
  // Если нет body, пропускаем
  if (!req.body || Object.keys(req.body).length === 0) {
    // Если есть файл, это нормально - значит обновляется только аватар
    if (req.file) {
      req.body = {};
      return next();
    }
    return res.status(400).json({
      error: 'Validation error',
      message: 'At least one field must be provided',
    });
  }

  const parsed = { ...req.body };

  // Парсим privacySettings если это строка JSON
  if (parsed.privacySettings) {
    if (typeof parsed.privacySettings === 'string' && parsed.privacySettings.trim() !== '') {
      try {
        parsed.privacySettings = JSON.parse(parsed.privacySettings);
      } catch (e) {
        // Если не удалось распарсить, удаляем
        delete parsed.privacySettings;
      }
    } else if (parsed.privacySettings === '') {
      delete parsed.privacySettings;
    }
  }

  // Преобразуем language если нужно
  if (parsed.language && typeof parsed.language === 'string') {
    parsed.language = parsed.language.trim();
    if (parsed.language === '') {
      delete parsed.language;
    }
  }

  // Преобразуем tagPrefix если нужно
  if (parsed.tagPrefix && typeof parsed.tagPrefix === 'string') {
    parsed.tagPrefix = parsed.tagPrefix.trim();
    if (parsed.tagPrefix === '') {
      delete parsed.tagPrefix;
    }
  }

  // Преобразуем displayName если нужно
  if (parsed.displayName && typeof parsed.displayName === 'string') {
    parsed.displayName = parsed.displayName.trim();
    if (parsed.displayName === '') {
      delete parsed.displayName;
    }
  }

  // Удаляем пустые строки
  Object.keys(parsed).forEach(key => {
    if (parsed[key] === '' || parsed[key] === null || parsed[key] === undefined) {
      delete parsed[key];
    }
  });

  // Если нет полей в body и нет файла, возвращаем ошибку
  if (Object.keys(parsed).length === 0 && !req.file) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'At least one field must be provided',
    });
  }

  req.body = parsed;
  next();
};

export default parseFormData;

