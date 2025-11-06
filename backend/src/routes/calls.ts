import express from 'express';
import CallSession from '../models/CallSession';
import Caller from '../models/Caller';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Start new call session
router.post('/start', async (req, res) => {
  try {
    const { callerId, callerName } = req.body;
    const sessionId = uuidv4();

    // Update or create caller
    await Caller.findOneAndUpdate(
      { callerId },
      {
        callerId,
        name: callerName,
        lastCallAt: new Date(),
        $inc: { totalCalls: 1 }
      },
      { upsert: true, new: true }
    );

    // Create call session
    const session = new CallSession({
      sessionId,
      callerId,
      status: 'active'
    });

    await session.save();

    res.json({
      sessionId,
      status: 'active',
      startTime: session.startTime
    });

  } catch (error) {
    console.error('Error starting call session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End call session
router.post('/:sessionId/end', async (req, res) => {
  try {
    const session = await CallSession.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      {
        status: 'ended',
        endTime: new Date()
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error ending call session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add transcript entry
router.post('/:sessionId/transcript', async (req, res) => {
  try {
    const { speaker, message } = req.body;
    
    const session = await CallSession.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      {
        $push: {
          transcript: {
            speaker,
            message,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding transcript:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get call session
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await CallSession.findOne({ sessionId: req.params.sessionId });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching call session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all call sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await CallSession.find()
      .sort({ startTime: -1 })
      .limit(50);
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching call sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;