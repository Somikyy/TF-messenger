import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём директорию для аудио файлов, если её нет
const uploadsDir = path.join(__dirname, '../../uploads/audio');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла: timestamp-random-uuid.extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `audio-${uniqueSuffix}${ext}`);
  },
});

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
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

// Настройка multer
export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB максимум
  },
});

// Middleware для получения URL файла
export const getAudioUrl = (req, res, next) => {
  if (req.file) {
    // Формируем URL для доступа к файлу
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    req.file.url = `${baseUrl}/uploads/audio/${req.file.filename}`;
  }
  next();
};

export default {
  uploadAudio,
  getAudioUrl,
};

