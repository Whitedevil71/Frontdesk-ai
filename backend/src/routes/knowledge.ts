import express from 'express';
import { KnowledgeBaseService } from '../services/kbService';

const router = express.Router();
const kbService = new KnowledgeBaseService();

// Get all knowledge items
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let items;
    if (search) {
      items = await kbService.searchKnowledgeItems(search as string);
    } else {
      items = await kbService.getAllKnowledgeItems();
    }
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching knowledge items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create knowledge item
router.post('/', async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }
    
    const item = await kbService.addKnowledgeItem(question, answer, category);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating knowledge item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update knowledge item
router.put('/:id', async (req, res) => {
  try {
    const { question, answer, category, confidence } = req.body;
    
    const item = await kbService.updateKnowledgeItem(req.params.id, {
      question,
      answer,
      category,
      confidence
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Knowledge item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error updating knowledge item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete knowledge item
router.delete('/:id', async (req, res) => {
  try {
    const item = await kbService.deleteKnowledgeItem(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Knowledge item not found' });
    }
    
    res.json({ message: 'Knowledge item deleted successfully' });
  } catch (error) {
    console.error('Error deleting knowledge item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;