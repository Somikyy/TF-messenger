import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём директории для файлов, если их нет
const audioUploadsDir = path.join(__dirname, '../../uploads/audio');
const avatarUploadsDir = path.join(__dirname, '../../uploads/avatars');
const photoUploadsDir = path.join(__dirname, '../../uploads/photos');
const videoUploadsDir = path.join(__dirname, '../../uploads/videos');
const fileUploadsDir = path.join(__dirname, '../../uploads/files');

if (!fs.existsSync(audioUploadsDir)) {
  fs.mkdirSync(audioUploadsDir, { recursive: true });
}
if (!fs.existsSync(avatarUploadsDir)) {
  fs.mkdirSync(avatarUploadsDir, { recursive: true });
}
if (!fs.existsSync(photoUploadsDir)) {
  fs.mkdirSync(photoUploadsDir, { recursive: true });
}
if (!fs.existsSync(videoUploadsDir)) {
  fs.mkdirSync(videoUploadsDir, { recursive: true });
}
if (!fs.existsSync(fileUploadsDir)) {
  fs.mkdirSync(fileUploadsDir, { recursive: true });
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

// Настройка хранилища для фотографий
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photoUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

// Настройка хранилища для видео
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  },
});

// Настройка хранилища для файлов
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

// Фильтр для проверки типа фотографии
const photoFileFilter = (req, file, cb) => {
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

// Фильтр для проверки типа видео
const videoFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/ogg',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла. Разрешены только видео файлы.'), false);
  }
};

// Фильтр для проверки типа файла (любые файлы кроме аудио, фото, видео)
const generalFileFilter = (req, file, cb) => {
  // Разрешаем любые файлы, кроме тех, что уже обрабатываются отдельно
  const disallowedMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/m4a',
    'audio/aac',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/ogg',
  ];

  if (!disallowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Этот тип файла должен быть загружен через соответствующий эндпоинт.'), false);
  }
};

// Настройка multer для фотографий (до 6MB)
export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFileFilter,
  limits: {
    fileSize: 6 * 1024 * 1024, // 6MB максимум
  },
});

// Настройка multer для видео (до 50MB)
export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB максимум
  },
});

// Настройка multer для файлов (до 1GB)
export const uploadFile = multer({
  storage: fileStorage,
  fileFilter: generalFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB максимум
  },
});

// Универсальный storage, который определяет тип файла по MIME типу
const universalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mimeType = file.mimetype;
    
    if (mimeType.startsWith('image/')) {
      cb(null, photoUploadsDir);
    } else if (mimeType.startsWith('video/')) {
      cb(null, videoUploadsDir);
    } else if (mimeType.startsWith('audio/')) {
      cb(null, audioUploadsDir);
    } else {
      cb(null, fileUploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const mimeType = file.mimetype;
    
    if (mimeType.startsWith('image/')) {
      cb(null, `photo-${uniqueSuffix}${ext}`);
    } else if (mimeType.startsWith('video/')) {
      cb(null, `video-${uniqueSuffix}${ext}`);
    } else if (mimeType.startsWith('audio/')) {
      cb(null, `audio-${uniqueSuffix}${ext}`);
    } else {
      cb(null, `file-${uniqueSuffix}${ext}`);
    }
  },
});

// Универсальный фильтр файлов (разрешаем все типы файлов)
const universalFileFilter = (req, file, cb) => {
  // Разрешаем все типы файлов
  // Проверка размера будет выполнена в контроллере после загрузки
  cb(null, true);
};

// Универсальный upload middleware для всех типов файлов
export const uploadUniversal = multer({
  storage: universalStorage,
  fileFilter: universalFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB максимум (проверка размера по типу делается в фильтре)
  },
});

// Middleware для получения URL файла на основе его типа
export const getUniversalFileUrl = (req, res, next) => {
  if (req.file) {
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const mimeType = req.file.mimetype;
    
    if (mimeType.startsWith('image/')) {
      req.file.url = `${baseUrl}/uploads/photos/${req.file.filename}`;
    } else if (mimeType.startsWith('video/')) {
      req.file.url = `${baseUrl}/uploads/videos/${req.file.filename}`;
    } else if (mimeType.startsWith('audio/')) {
      req.file.url = `${baseUrl}/uploads/audio/${req.file.filename}`;
    } else {
      req.file.url = `${baseUrl}/uploads/files/${req.file.filename}`;
    }
  }
  next();
};

// Middleware для получения URL фотографии
export const getPhotoUrl = (req, res, next) => {
  if (req.file) {
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    req.file.url = `${baseUrl}/uploads/photos/${req.file.filename}`;
  }
  next();
};

// Middleware для получения URL видео
export const getVideoUrl = (req, res, next) => {
  if (req.file) {
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    req.file.url = `${baseUrl}/uploads/videos/${req.file.filename}`;
  }
  next();
};

// Middleware для получения URL файла
export const getFileUrl = (req, res, next) => {
  if (req.file) {
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    req.file.url = `${baseUrl}/uploads/files/${req.file.filename}`;
  }
  next();
};

export default {
  uploadAudio,
  uploadAvatar,
  uploadPhoto,
  uploadVideo,
  uploadFile,
  getAudioUrl,
  getAvatarUrl,
  getPhotoUrl,
  getVideoUrl,
  getFileUrl,
};

