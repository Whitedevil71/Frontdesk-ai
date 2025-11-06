import mongoose, { Document, Schema } from 'mongoose';

export interface IHelpRequest extends Document {
  question: string;
  callerId: string;
  sessionId?: string;
  status: 'pending' | 'resolved' | 'unresolved';
  supervisorResponse?: string;
  confidence: number;
  createdAt: Date;
  resolvedAt?: Date;
  timeoutAt: Date;
}

const helpRequestSchema = new Schema<IHelpRequest>({
  question: { type: String, required: true },
  callerId: { type: String, required: true },
  sessionId: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'resolved', 'unresolved'], 
    default: 'pending' 
  },
  supervisorResponse: { type: String },
  confidence: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  timeoutAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  }
});

// Index for timeout cleanup
helpRequestSchema.index({ timeoutAt: 1 });

export default mongoose.model<IHelpRequest>('HelpRequest', helpRequestSchema);