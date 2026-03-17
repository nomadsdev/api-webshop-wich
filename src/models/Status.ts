import mongoose, { Document, Schema } from 'mongoose';

export interface IStatus extends Document {
  title: string; 
  subtitle: string; 
  count: string; 
  unit: string; 
  order: number; 
  isActive: boolean; 
  createdAt: Date;
  updatedAt: Date;
}

const StatusSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


StatusSchema.index({ order: 1 }, { unique: true });
StatusSchema.index({ isActive: 1 });

export default mongoose.model<IStatus>('Status', StatusSchema);







