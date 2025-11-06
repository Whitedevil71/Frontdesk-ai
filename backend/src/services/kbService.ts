import KnowledgeItem from '../models/KnowledgeItem';

export class KnowledgeBaseService {
  async addKnowledgeItem(question: string, answer: string, category?: string) {
    try {
      // Check if similar question already exists
      const existing = await KnowledgeItem.findOne({
        question: { $regex: question, $options: 'i' }
      });

      if (existing) {
        // Update existing item
        existing.answer = answer;
        existing.updatedAt = new Date();
        existing.confidence = Math.min(existing.confidence + 0.1, 1.0);
        return await existing.save();
      } else {
        // Create new item
        const newItem = new KnowledgeItem({
          question,
          answer,
          category,
          confidence: 0.8
        });
        return await newItem.save();
      }
    } catch (error) {
      console.error('Error adding knowledge item:', error);
      throw error;
    }
  }

  async getAllKnowledgeItems() {
    return await KnowledgeItem.find({ isActive: true })
      .sort({ updatedAt: -1 });
  }

  async searchKnowledgeItems(query: string) {
    try {
      return await KnowledgeItem.find({
        $text: { $search: query },
        isActive: true
      }).sort({ confidence: -1 });
    } catch {
      // Fallback to regex search
      return await KnowledgeItem.find({
        $or: [
          { question: { $regex: query, $options: 'i' } },
          { answer: { $regex: query, $options: 'i' } }
        ],
        isActive: true
      }).sort({ confidence: -1 });
    }
  }

  async updateKnowledgeItem(id: string, updates: Partial<{
    question: string;
    answer: string;
    category: string;
    confidence: number;
  }>) {
    return await KnowledgeItem.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteKnowledgeItem(id: string) {
    return await KnowledgeItem.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }
}