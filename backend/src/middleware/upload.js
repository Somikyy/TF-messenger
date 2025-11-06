import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём директории для файлов, если их нет
const audioUploadsDir = path.join(__dirname, '../../uploads/audio');
const avatarUploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(audioUploadsDir)) {
  fs.mkdirSync(audioUploadsDir, { recursive: true });
}
if (!fs.existsSync(avatarUploadsDir)) {
  fs.mkdirSync(avatarUploadsDir, { recursive: true });
}

// Настройка хранилища для аудио файлов
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioUploadsDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла: timestamp-random-uuid.extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `audio-${uniqueSuffix}${ext}`);
  },
});

// Настройка хранилища для аватаров
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarUploadsDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла: timestamp-random-uuid.extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// Фильтр для проверки типа аудио файла
const audioFileFilter = (req, file, cb) => {
  // Разрешаем только аудио файлы
  const allowedMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/m4a',
    'audio/aac',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла. Разрешены только аудио файлы.'), false);
  }
};

// Фильтр для проверки типа изображения (аватар)
const avatarFileFilter = (req, file, cb) => {
  // Разрешаем только изображения
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла. Разрешены только изображения.'), false);
  }
};

// Настройка multer для аудио
export const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB максимум
  },
});

// Настройка multer для аватаров
export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB максимум
  },
});

// Middleware для получения URL аудио файла
export const getAudioUrl = (req, res, next) => {
  if (req.file) {
    // Формируем URL для доступа к файлу
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    req.file.url = `${baseUrl}/uploads/audio/${req.file.filename}`;
  }
  next();
};

// Middleware для получения URL аватара
export const getAvatarUrl = (req, res, next) => {
  if (req.file) {
    // Формируем URL для доступа к файлу
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    req.file.url = `${baseUrl}/uploads/avatars/${req.file.filename}`;
  }
  next();
};

export default {
  uploadAudio,
  uploadAvatar,
  getAudioUrl,
  getAvatarUrl,
};

