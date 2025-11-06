# TF-Messenger (The Free Messenger)

A full-featured, open-source real-time messaging application built with modern web technologies. TF-Messenger is designed to be a free, open platform that anyone can use, modify, and contribute to.

## 🚀 Features

- **Real-time messaging** with WebSocket support
- **Direct and group chats** with unlimited participants
- **User authentication** with JWT tokens
- **Message management** - send, delete messages
- **Group management** - create groups, add/remove participants, kick users
- **User search** to find and start conversations
- **Online/offline status** indicators
- **Typing indicators** for real-time feedback
- **Message read receipts**
- **Responsive design** with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Prisma ORM
- **Socket.io** for WebSocket real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **Zustand** for state management
- **Tailwind CSS** for styling
- **React Hook Form** for form validation
- **Socket.io-client** for WebSocket connection

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Docker** and **Docker Compose** (optional, for containerized setup)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TF-Messenger.git
   cd TF-Messenger
   ```

2. **Set up environment variables**
   
   Create `backend/.env`:
   ```env
   DATABASE_URL="postgresql://messenger_user:your_password@localhost:5432/messenger?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
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

   This will start:
   - PostgreSQL database
   - Backend API server
   - Frontend development server

4. **Run database migrations**
   ```bash
   docker-compose exec backend npm run prisma:migrate:deploy
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/health

### Option 2: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TF-Messenger.git
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
   cp .env.example .env
   # Edit .env with your database credentials
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

4. **Set up frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
TF-Messenger/
├── backend/                 # Backend API server
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── websocket/      # WebSocket handlers
│   └── package.json
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and WebSocket services
│   │   ├── store/          # Zustand state management
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── docker-compose.yml      # Docker Compose configuration
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `PORT` - Backend server port (default: 3001)
- `CORS_ORIGIN` - Allowed CORS origin
- `NODE_ENV` - Environment (development/production)

### Frontend Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket server URL

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/search?search=query` - Search users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

### Chats
- `GET /api/chats` - Get all user chats
- `POST /api/chats` - Create a new chat
- `GET /api/chats/:id` - Get chat by ID
- `POST /api/chats/:id/participants` - Add participants to group
- `POST /api/chats/:id/participants/kick` - Kick participant from group
- `POST /api/chats/:id/leave` - Leave group chat
- `DELETE /api/chats/:id` - Delete chat (group creator only)

### Messages
- `GET /api/messages/chats/:chatId/messages` - Get chat messages
- `POST /api/messages/chats/:chatId/messages` - Send a message
- `DELETE /api/messages/:id` - Delete a message
- `PUT /api/messages/:id/read` - Mark messages as read

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

- Follow the existing code style
- Write clear commit messages
- Add tests for new features (if applicable)
- Update documentation as needed
- Be respectful and constructive in discussions

## 📝 License

This project is licensed under the **AGPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

### Important Restrictions

- **Commercial Use**: This software is **NOT** licensed for commercial use. You may not use this software in any commercial product or service.
- **Malicious Use**: This software may **NOT** be used for any malicious, harmful, or illegal purposes.
- **Free Use**: This software is free to use, modify, and distribute for non-commercial purposes, as long as you comply with the AGPL-3.0 license terms.

## ⚠️ Disclaimer

TF-Messenger is provided "as is" without warranty of any kind. The developers are not responsible for any misuse of this software. Users are responsible for ensuring compliance with all applicable laws and regulations.

## 🐛 Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub. Please include:

- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node.js version, etc.)

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with love for the open-source community
- Thanks to all contributors who make this project better

---

**TF-Messenger** - The Free Messenger. Free to use, free to modify, free to share.
