# Frontdesk AI Supervisor - Setup Guide

## Quick Start

1. **Install dependencies**:

```bash
# Root level
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Environment Setup**:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

3. **Configure Environment Variables**:

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=4000
MONGODB_URL=mongodb://localhost:27017/frontdesk

# LiveKit Configuration (optional for voice features)
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# OpenAI Configuration (required)
OPENAI_API_KEY=your-openai-api-key

# CORS
FRONTEND_URL=http://localhost:5173
```

4. **Start MongoDB**:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or use local MongoDB installation
mongod
```

5. **Seed Database** (optional):

```bash
cd backend
npm run seed
```

6. **Start Development Servers**:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

7. **Access Application**:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## Docker Setup

```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Build for production
npm run build
```

## Features Overview

- **Voice Simulator**: Test AI voice interactions
- **Admin Panel**: Supervisor interface for handling escalations
- **Knowledge Base**: View and manage AI training data
- **Real-time Notifications**: Socket.io powered updates

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Voice**: LiveKit SDK (optional)
- **AI**: OpenAI GPT-4

## Next Steps

1. Configure OpenAI API key for AI functionality
2. Set up LiveKit for voice features (optional)
3. Customize knowledge base with your business data
4. Deploy to production environment
