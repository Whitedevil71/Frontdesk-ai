import express from 'express';
import HelpRequest from '../models/HelpRequest';
import { AIService } from '../services/aiService';
import { KnowledgeBaseService } from '../services/kbService';
import { notifySupervisors, notifyCaller, notifyRequestUpdate } from '../services/socketService';

const router = express.Router();
const aiService = new AIService();
const kbService = new KnowledgeBaseService();

// Create new help request
router.post('/', async (req, res) => {
  try {
    const { question, callerId, sessionId } = req.body;

    // First, try to get AI response
    const aiResponse = await aiService.processQuestion(question);

    if (!aiResponse.shouldEscalate) {
      // AI can handle this, return direct response
      return res.json({
        type: 'direct',
        answer: aiResponse.answer,
        confidence: aiResponse.confidence
      });
    }

    // Create help request for escalation
    const helpRequest = new HelpRequest({
      question,
      callerId,
      sessionId,
      confidence: aiResponse.confidence
    });

    await helpRequest.save();

    // Notify supervisors
    notifySupervisors(helpRequest);

    res.json({
      type: 'escalated',
      requestId: helpRequest._id,
      message: "Let me check with my supervisor and get back to you shortly."
    });

  } catch (error) {
    console.error('Error creating help request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all help requests
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const requests = await HelpRequest.find(filter)
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching help requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific help request
router.get('/:id', async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching help request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Respond to help request
router.post('/:id/respond', async (req, res) => {
  try {
    const { response } = req.body;
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already resolved' });
    }

    // Update request
    request.supervisorResponse = response;
    request.status = 'resolved';
    request.resolvedAt = new Date();
    await request.save();

    // Add to knowledge base
    await kbService.addKnowledgeItem(request.question, response);

    // Notify caller
    notifyCaller(request.callerId, response);

    // Notify supervisors of update
    notifyRequestUpdate(request);

    res.json(request);
  } catch (error) {
    console.error('Error responding to help request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark request as unresolved
router.post('/:id/unresolved', async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = 'unresolved';
    await request.save();

    notifyRequestUpdate(request);

    res.json(request);
  } catch (error) {
    console.error('Error marking request as unresolved:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;