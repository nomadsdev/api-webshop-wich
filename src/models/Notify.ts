import mongoose, { Document, Schema } from 'mongoose';

export interface INotify extends Document {
  title: string;
  content: string;
  type: 'news' | 'blog' | 'announcement' | 'maintenance';
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  isPinned: boolean;
  imageUrl?: string;
  link?: string;
  tags: string[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const NotifySchema = new Schema<INotify>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['news', 'blog', 'announcement', 'maintenance'],
    default: 'news'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  isPinned: {
    type: Boolean,
    required: true,
    default: false
  },
  imageUrl: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  viewCount: {
    type: Number,
    required: true,
    default: 0
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
NotifySchema.index({ isActive: 1, isPinned: -1, publishedAt: -1 });
NotifySchema.index({ type: 1, isActive: 1 });
NotifySchema.index({ priority: 1, isActive: 1 });

export const Notify = mongoose.model<INotify>('Notify', NotifySchema);
