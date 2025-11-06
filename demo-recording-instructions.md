# Demo Recording Instructions (2-4 minutes)

## Pre-Demo Setup

1. Ensure all services are running (backend, frontend, MongoDB)
2. Have your microphone ready and test audio permissions
3. Open browser to http://localhost:5173
4. Have a supervisor window ready for the admin panel

## Demo Script

### Part 1: Voice Call Simulation (60 seconds)

1. **Navigate to Simulator page**
2. **Click "Start Voice Call"** - allow microphone permissions
3. **Speak clearly**: "Do you do keratin treatments?"
4. **Show AI Response**: AI should respond with voice about keratin treatments
5. **Ask escalation question**: "What's your cancellation policy for same-day appointments?"
6. **Show escalation**: AI should say "Let me check with my supervisor and get back to you"

### Part 2: Supervisor Interface (90 seconds)

1. **Switch to Admin Panel** (new tab or window)
2. **Show Pending Requests**: Display the escalated question
3. **Click on the request** to view details
4. **Type supervisor response**: "Same-day cancellations require 2-hour notice, otherwise 50% charge applies"
5. **Click Respond** - show the request moves to resolved
6. **Demonstrate real-time**: Show the original caller gets immediate follow-up

### Part 3: Knowledge Base Learning (45 seconds)

1. **Navigate to Learned Answers page**
2. **Show the new Q&A pair** was automatically added
3. **Test knowledge**: Start another voice call
4. **Ask the same question**: "What's your cancellation policy for same-day appointments?"
5. **Show AI now knows**: AI should respond immediately without escalation

### Part 4: System Overview (30 seconds)

1. **Show request history** - pending, resolved, unresolved states
2. **Demonstrate timeout** (optional - show unresolved after timeout)
3. **Show real-time notifications** working in supervisor panel

## Key Points to Highlight

- **Full voice integration** with LiveKit (not just chat)
- **Intelligent escalation** based on AI confidence
- **Real-time supervisor notifications**
- **Automatic knowledge base updates**
- **Complete request lifecycle management**
- **Clean, functional UI** for supervisors

## Technical Demo Notes

- Speak clearly and wait for AI responses
- Show both caller and supervisor perspectives
- Highlight the real-time nature of notifications
- Demonstrate the learning aspect (AI gets smarter)
- Show the voice quality and natural conversation flow

## Backup Demo (if voice issues)

If LiveKit voice has issues during demo:

1. Use the text simulation mode
2. Show the same workflow with text input
3. Explain that voice integration is fully implemented
4. Show the LiveKit configuration and code structure
