import mongoose, { Document, Schema } from 'mongoose';

export interface IKnowledgeItem extends Document {
  question: string;
  answer: string;
  category?: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const knowledgeItemSchema = new Schema<IKnowledgeItem>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String },
  confidence: { type: Number, default: 0.8 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Text search index
knowledgeItemSchema.index({ 
  question: 'text', 
  answer: 'text' 
});

export default mongoose.model<IKnowledgeItem>('KnowledgeItem', knowledgeItemSchema);