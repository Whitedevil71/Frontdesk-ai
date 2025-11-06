import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import helpRequestRoutes from './routes/helpRequests';
import knowledgeRoutes from './routes/knowledge';
import callRoutes from './routes/calls';
import livekitRoutes from './routes/livekit';
import { initializeSocket } from './services/socketService';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://frontdesk-ai-supervisor.vercel.app",
      "https://frontdesk-axvaym8jp-arpit-sharmas-projects-ae7bd030.vercel.app",
      "http://localhost:5173",
      /\.vercel\.app$/
    ],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://frontdesk-ai-supervisor.vercel.app",
    "https://frontdesk-axvaym8jp-arpit-sharmas-projects-ae7bd030.vercel.app",
    "http://localhost:5173",
    /\.vercel\.app$/
  ]
}));
app.use(express.json());

// Initialize Socket.io
initializeSocket(io);

// Routes
app.use('/api/help-requests', helpRequestRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/livekit', livekitRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/frontdesk');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Falling back to in-memory database for demo');
  }
};

const PORT = process.env.PORT || 10000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('LiveKit URL:', process.env.LIVEKIT_URL);
    console.log('OpenAI API configured');
  });
});

export { io };