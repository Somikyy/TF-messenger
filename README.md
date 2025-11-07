<div align="center">

# 💬 TF-Messenger

**The Free Messenger** - A modern, open-source real-time messaging application

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue.svg)](https://www.postgresql.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About

TF-Messenger is a full-featured, open-source real-time messaging application built with modern web technologies. It's designed to be a free, open platform that anyone can use, modify, and contribute to.

### ✨ Key Highlights

- 🚀 **Real-time Communication** - Instant messaging powered by WebSocket
- 🔒 **Secure** - JWT authentication and encrypted password storage
- 🌍 **Internationalization** - Support for multiple languages (Russian, English)
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Beautiful interface built with Tailwind CSS
- 🎤 **Voice Messages** - Send and receive voice recordings
- 👥 **Group Chats** - Create and manage group conversations
- 🔍 **User Search** - Find and connect with other users easily

---

## 🚀 Features

### 💬 Messaging
- ✅ **Real-time messaging** with WebSocket support
- ✅ **Direct and group chats** with unlimited participants
- ✅ **Voice messages** - Record and send audio messages
- ✅ **Message types** - Text, images, videos, audio, and files
- ✅ **Message management** - Send, delete, and edit messages
- ✅ **Read receipts** - See when messages are read
- ✅ **Typing indicators** - Real-time feedback when someone is typing

### 👤 User Features
- ✅ **User authentication** with JWT tokens
- ✅ **User profiles** with customizable avatars
- ✅ **User tags** - Unique identifiers (e.g., @username.1234)
- ✅ **Privacy settings** - Control who can see you online, message you, find you, and add you to groups
- ✅ **Online/offline status** indicators
- ✅ **User search** to find and start conversations
- ✅ **Language selection** - Choose interface language (Russian/English)

### 👥 Group Management
- ✅ **Create groups** - Start group conversations
- ✅ **Add participants** - Invite users to groups
- ✅ **Remove participants** - Kick users from groups
- ✅ **Leave groups** - Exit group conversations
- ✅ **Group avatars** - Customize group appearance
- ✅ **Group creator controls** - Special permissions for group creators

### 🎨 UI/UX
- ✅ **Responsive design** - Works on all screen sizes
- ✅ **Modern interface** - Clean and intuitive design
- ✅ **Dark/Light theme** - Comfortable viewing in any lighting
- ✅ **Smooth animations** - Polished user experience
- ✅ **Context menus** - Right-click actions for quick access

---

## 🛠️ Tech Stack

### Backend
<div align="left">

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 18+ |
| **Express.js** | Web framework | 4.18+ |
| **PostgreSQL** | Database | 14+ |
| **Prisma** | ORM | 5.7+ |
| **Socket.io** | WebSocket communication | 4.7+ |
| **JWT** | Authentication | 9.0+ |
| **bcryptjs** | Password hashing | 2.4+ |
| **Multer** | File uploads | 2.0+ |
| **Joi** | Validation | 17.11+ |

</div>

### Frontend
<div align="left">

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 18.2+ |
| **TypeScript** | Type safety | 5.2+ |
| **Vite** | Build tool | 5.0+ |
| **Zustand** | State management | 4.4+ |
| **Tailwind CSS** | Styling | 3.3+ |
| **React Hook Form** | Form handling | 7.49+ |
| **Socket.io-client** | WebSocket client | 4.7+ |
| **Axios** | HTTP client | 1.6+ |

</div>

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Docker** and **Docker Compose** (optional, for containerized setup) - [Download](https://www.docker.com/)

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended) 🐳

The easiest way to get started is using Docker Compose:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Somikyy/TF-messenger.git
   cd TF-Messenger
   ```

2. **Set up environment variables**
   
   Create `backend/.env`:
   ```env
   DATABASE_URL="postgresql://messenger:messenger_password@postgres:5432/messenger?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   CORS_ORIGIN="http://localhost:5173"
   NODE_ENV="development"
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_WS_URL=http://localhost:3001
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will automatically start:
   - 🗄️ PostgreSQL database
   - 🔧 Backend API server
   - 🎨 Frontend development server
   - 📦 Run database migrations

4. **Access the application**
   - 🌐 Frontend: [http://localhost:5173](http://localhost:5173)
   - 🔌 Backend API: [http://localhost:3001](http://localhost:3001)
   - ❤️ API Health Check: [http://localhost:3001/health](http://localhost:3001/health)

### Option 2: Local Development 💻

For local development without Docker:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Somikyy/TF-messenger.git
   cd TF-Messenger
   ```

2. **Set up PostgreSQL database**
   
   Create a PostgreSQL database and user:
   ```sql
   CREATE DATABASE messenger;
   CREATE USER messenger_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE messenger TO messenger_user;
   ALTER ROLE messenger_user CREATEDB;
   ```

3. **Set up backend**
   ```bash
   cd backend
   npm install
   ```
   
   Create `backend/.env`:
   ```env
   DATABASE_URL="postgresql://messenger_user:your_password@localhost:5432/messenger?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   CORS_ORIGIN="http://localhost:5173"
   NODE_ENV="development"
   ```
   
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

4. **Set up frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   ```
   
   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_WS_URL=http://localhost:3001
   ```
   
   ```bash
   npm run dev
   ```

5. **Access the application**
   - 🌐 Frontend: [http://localhost:5173](http://localhost:5173)
   - 🔌 Backend API: [http://localhost:3001](http://localhost:3001)

## 🧪 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user | ❌ No |
| `POST` | `/api/auth/login` | Login user | ❌ No |
| `GET` | `/api/auth/me` | Get current user | ✅ Yes |

### 👤 Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users/search?search=query` | Search users | ✅ Yes |
| `GET` | `/api/users/:id` | Get user by ID | ✅ Yes |
| `PUT` | `/api/users/:id` | Update user profile | ✅ Yes |

### 💬 Chats

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/chats` | Get all user chats | ✅ Yes |
| `POST` | `/api/chats` | Create a new chat | ✅ Yes |
| `GET` | `/api/chats/:id` | Get chat by ID | ✅ Yes |
| `POST` | `/api/chats/:id/participants` | Add participants to group | ✅ Yes |
| `POST` | `/api/chats/:id/participants/kick` | Kick participant from group | ✅ Yes |
| `POST` | `/api/chats/:id/leave` | Leave group chat | ✅ Yes |
| `DELETE` | `/api/chats/:id` | Delete chat (group creator only) | ✅ Yes |

### 📨 Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/messages/chats/:chatId/messages` | Get chat messages | ✅ Yes |
| `POST` | `/api/messages/chats/:chatId/messages` | Send a message | ✅ Yes |
| `POST` | `/api/messages/chats/:chatId/messages` | Send voice message (multipart/form-data) | ✅ Yes |
| `DELETE` | `/api/messages/:id` | Delete a message | ✅ Yes |
| `PUT` | `/api/messages/:id/read` | Mark messages as read | ✅ Yes |

---

## 🎯 Available Scripts

### Backend Scripts

```bash
# Development
npm run dev              # Start development server with nodemon

# Production
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations (development)
npm run prisma:migrate:deploy  # Deploy migrations (production)
npm run prisma:studio    # Open Prisma Studio
```

### Frontend Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
```

---

## 🤝 Contributing

We welcome contributions from everyone! TF-Messenger is an open-source project, and we encourage you to participate.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Contribution Guidelines

- ✅ Follow the existing code style
- ✅ Write clear commit messages
- ✅ Add tests for new features (if applicable)
- ✅ Update documentation as needed
- ✅ Be respectful and constructive in discussions

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📝 License

This project is licensed under the **AGPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

### ⚠️ Important Restrictions

- **Commercial Use**: This software is **NOT** licensed for commercial use. You may not use this software in any commercial product or service.
- **Malicious Use**: This software may **NOT** be used for any malicious, harmful, or illegal purposes.
- **Free Use**: This software is free to use, modify, and distribute for non-commercial purposes, as long as you comply with the AGPL-3.0 license terms.

---

## ⚠️ Disclaimer

TF-Messenger is provided "as is" without warranty of any kind. The developers are not responsible for any misuse of this software. Users are responsible for ensuring compliance with all applicable laws and regulations.

---

## 🐛 Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub. Please include:

- 📝 Description of the issue
- 🔄 Steps to reproduce
- ✅ Expected behavior
- ❌ Actual behavior
- 📸 Screenshots (if applicable)
- 💻 Environment details (OS, Node.js version, etc.)

---

## 📧 Contact & Support

For questions or support, please open an issue on [GitHub](https://github.com/Somikyy/TF-messenger/issues).

---

## 🙏 Acknowledgments

- Built with ❤️ for the open-source community
- Thanks to all contributors who make this project better
- Inspired by modern messaging applications

---

<div align="center">

**TF-Messenger** - The Free Messenger. Free to use, free to modify, free to share.

Made with ❤️ by the open-source community

[⭐ Star us on GitHub](https://github.com/Somikyy/TF-messenger) • [🐛 Report Bug](https://github.com/Somikyy/TF-messenger/issues) • [💡 Request Feature](https://github.com/Somikyy/TF-messenger/issues)

</div>
