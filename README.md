# Frontdesk AI Supervisor

🎤 **Complete Voice-Enabled AI Supervisor System** 🔊

A MERN application that implements an AI agent for handling incoming calls with human supervisor escalation when the AI is uncertain about answers.

## 🚀 Live Demo

- **Frontend**: `https://frontdesk-ai-supervisor.vercel.app` (after deployment)
- **Backend**: `https://frontdesk-ai-backend.onrender.com` (after deployment)

## ✨ Features

- **🎤 Voice Conversations**: Real speech recognition + AI voice responses
- **🤖 Smart AI Agent**: GPT-3.5-turbo powered responses from knowledge base
- **👥 Human Escalation**: Automatic escalation to supervisors when AI is uncertain
- **⚡ Real-time Notifications**: Socket.io for instant supervisor alerts
- **📚 Learning System**: Auto-updating Q&A database from supervisor responses
- **🔄 Request Lifecycle**: Pending → Resolved/Unresolved with timeout handling
- **💼 Admin Panel**: Complete supervisor interface for managing requests

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas (Cloud)
- **Real-time**: Socket.io
- **Voice**: Browser Speech API + LiveKit SDK
- **AI**: OpenAI GPT-3.5-turbo
- **Deployment**: Vercel (Frontend) + Render (Backend)

## 🎯 Quick Demo

1. **Voice Simulator**: Enable voice mode and speak to the AI
2. **Ask Questions**: "Do you do keratin treatments?" → AI responds with voice
3. **Test Escalation**: "What's your cancellation policy?" → Goes to supervisor
4. **Admin Panel**: Supervisors can respond in real-time
5. **Learning**: AI learns from supervisor responses

## 🚀 Deployment

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- OpenAI API key
- LiveKit account (optional)

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Production Deployment

See `deploy-vercel-render.md` for complete deployment instructions to Vercel + Render.

## 🎪 Demo Instructions

Follow `demo-recording-instructions.md` for detailed demo steps.

## 📊 Architecture

### Database Models

- **HelpRequest**: Escalated questions with lifecycle management
- **KnowledgeItem**: Q&A pairs for AI training
- **CallSession**: Voice call session tracking
- **Caller**: Customer information

### Key Services

- **aiService**: OpenAI integration with confidence scoring
- **livekitService**: Voice call management
- **socketService**: Real-time supervisor notifications
- **kbService**: Knowledge base management

## 🔒 Environment Variables

Required for production:

```env
# Backend
MONGODB_URL=your_mongodb_atlas_url
OPENAI_API_KEY=your_openai_key
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret

# Frontend
VITE_API_URL=your_backend_url/api
VITE_SOCKET_URL=your_backend_url
```

## 💰 Operating Costs

- **Free Tier**: $0/month (with limitations)
- **Production**: ~$37-97/month (24/7 uptime)

## 🎯 Key Features Demonstrated

- ✅ Complete voice conversation (input + output)
- ✅ Real AI processing with knowledge base
- ✅ Smart escalation to human supervisors
- ✅ Real-time notifications and updates
- ✅ Automatic learning from interactions
- ✅ Professional admin interface

## 📱 Browser Support

Voice features work on:

- Chrome (Desktop/Mobile) ✅
- Edge (Desktop/Mobile) ✅
- Safari (Desktop/Mobile) ✅
- Firefox (Text fallback) ⚠️

## 🤝 Contributing

This is a production-ready AI supervisor system. For improvements or issues, please create a pull request.

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with ❤️ for seamless AI-human collaboration**
