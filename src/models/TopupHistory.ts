import mongoose, { Document, Schema } from 'mongoose';

export interface ITopupHistory extends Document {
  userId: mongoose.Types.ObjectId;
  transactionId: string;
  amount: number;
  sender: string;
  receiver: string;
  transactionDate: Date;
  pointsAdded: number;
  status: 'success' | 'failed' | 'pending';
  type: 'bank_slip' | 'truemoney_gift' | 'coupon';
  errorCode?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TopupHistorySchema = new Schema<ITopupHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  sender: {
    type: String,
    required: true,
    trim: true
  },
  receiver: {
    type: String,
    required: true,
    trim: true
  },
  transactionDate: {
    type: Date,
    required: true
  },
  pointsAdded: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['bank_slip', 'truemoney_gift', 'coupon'],
    default: 'bank_slip'
  },
  errorCode: {
    type: String,
    trim: true
  },
  errorMessage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
TopupHistorySchema.index({ userId: 1, createdAt: -1 });
TopupHistorySchema.index({ transactionId: 1 }, { unique: true });

export const TopupHistory = mongoose.model<ITopupHistory>('TopupHistory', TopupHistorySchema);
