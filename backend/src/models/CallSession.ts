import mongoose, { Document, Schema } from 'mongoose';

export interface ICallSession extends Document {
  sessionId: string;
  callerId: string;
  status: 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
  transcript: Array<{
    speaker: 'caller' | 'ai';
    message: string;
    timestamp: Date;
  }>;
  helpRequests: string[]; // References to HelpRequest IDs
}

const callSessionSchema = new Schema<ICallSession>({
  sessionId: { type: String, required: true, unique: true },
  callerId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'ended'], 
    default: 'active' 
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  transcript: [{
    speaker: { type: String, enum: ['caller', 'ai'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  helpRequests: [{ type: String }]
});

export default mongoose.model<ICallSession>('CallSession', callSessionSchema);