# Frontdesk AI Supervisor - Demo Script

## Application is Running!

✅ **Backend**: http://localhost:4000 (API + Socket.io)
✅ **Frontend**: http://localhost:5173 (React App)
✅ **Database**: In-memory (for demo purposes)
✅ **AI Service**: Mock service with realistic responses

## Demo Flow

### 1. Dashboard Overview

- Navigate to http://localhost:5173
- Shows system statistics and overview
- Real-time data from in-memory database

### 2. Voice Call Simulator

- Go to "Voice Simulator" tab
- Click "Start Call" to begin a session
- Try these test questions:
  - "Do you do keratin treatments?" → AI responds directly
  - "What's your cancellation policy?" → Escalates to supervisor

### 3. Admin Panel (Supervisor Interface)

- Open new tab: http://localhost:5173/admin
- Shows pending requests in real-time
- Click on a pending request to respond
- Type a response and click "Send Response"
- Watch the caller get notified instantly

### 4. Knowledge Base Learning

- Go to "Knowledge Base" tab
- See automatically learned Q&A pairs
- Add/edit/delete knowledge items
- Search functionality works

## Key Features Demonstrated

🎯 **AI-First Approach**: AI handles known questions directly
🎯 **Smart Escalation**: Low-confidence questions go to supervisors
🎯 **Real-time Updates**: Socket.io powers instant notifications
🎯 **Learning System**: Supervisor responses become AI knowledge
🎯 **Complete Lifecycle**: Pending → Resolved/Unresolved with timeouts

## Test Scenarios

### Scenario 1: Direct AI Response

1. Start a call in simulator
2. Ask: "Do you do keratin treatments?"
3. AI responds immediately with detailed answer

### Scenario 2: Escalation Flow

1. Start a call in simulator
2. Ask: "What's your cancellation policy for same-day appointments?"
3. AI escalates to supervisor
4. Switch to Admin Panel
5. Respond as supervisor
6. See caller get instant response
7. Check Knowledge Base - new Q&A added automatically

### Scenario 3: Learning Verification

1. Start another call
2. Ask the same cancellation policy question
3. AI now responds directly (learned from supervisor)

## Architecture Highlights

- **MERN Stack**: MongoDB (in-memory), Express, React, Node.js
- **TypeScript**: Full type safety across frontend and backend
- **Real-time**: Socket.io for instant communication
- **Modular Design**: Clean separation of concerns
- **Mock Services**: Demo-ready without external dependencies

## Production Readiness

To make this production-ready:

1. Replace in-memory DB with MongoDB
2. Add real OpenAI API key
3. Configure LiveKit for voice features
4. Add authentication and authorization
5. Deploy with Docker Compose

The application is fully functional and ready for demo recording!
