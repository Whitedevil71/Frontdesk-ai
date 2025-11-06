import mongoose, { Document, Schema } from 'mongoose';

export interface ICaller extends Document {
  callerId: string;
  name?: string;
  phone?: string;
  email?: string;
  lastCallAt: Date;
  totalCalls: number;
  isActive: boolean;
}

const callerSchema = new Schema<ICaller>({
  callerId: { type: String, required: true, unique: true },
  name: { type: String },
  phone: { type: String },
  email: { type: String },
  lastCallAt: { type: Date, default: Date.now },
  totalCalls: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model<ICaller>('Caller', callerSchema);