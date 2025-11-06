import express from 'express';
import { LiveKitService } from '../services/livekitService';
import { AIService } from '../services/aiService';

const router = express.Router();
const livekitService = new LiveKitService();
const aiService = new AIService();

// Generate access token for LiveKit room
router.post('/token', async (req, res) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ error: 'Room name and participant name are required' });
    }

    // Create room if it doesn't exist
    await livekitService.createRoom(roomName);

    // Generate access token
    const token = await livekitService.generateAccessToken(roomName, participantName);

    res.json({
      token,
      url: process.env.LIVEKIT_URL
    });

  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End LiveKit room
router.post('/room/:roomName/end', async (req, res) => {
  try {
    await livekitService.endRoom(req.params.roomName);
    res.json({ success: true });
  } catch (error) {
    console.error('Error ending room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get room participants
router.get('/room/:roomName/participants', async (req, res) => {
  try {
    const participants = await livekitService.listParticipants(req.params.roomName);
    res.json(participants);
  } catch (error) {
    console.error('Error listing participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Text-to-speech endpoint
router.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioBuffer = await aiService.generateSpeech(text);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });

    res.send(audioBuffer);

  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Speech-to-text endpoint
router.post('/stt', async (req, res) => {
  try {
    if (!req.body || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const transcription = await aiService.transcribeAudio(req.body);

    res.json({ transcription });

  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;