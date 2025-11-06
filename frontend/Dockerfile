FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальные файлы
COPY . .

# Открываем порт
EXPOSE 5173

# Запускаем в dev режиме (для продакшена нужен build + nginx)
CMD ["npm", "run", "dev", "--", "--host"]

