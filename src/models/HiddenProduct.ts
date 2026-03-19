import mongoose, { Schema, Document } from 'mongoose';

export interface IHiddenProduct extends Document {
  productId: string;
  productName: string;
  isHidden: boolean;
  hiddenBy?: string;
  hiddenAt?: Date;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HiddenProductSchema: Schema = new Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: true,
    index: true
  },
  hiddenBy: {
    type: String,
    required: false
  },
  hiddenAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
HiddenProductSchema.index({ productId: 1, isHidden: 1 });
HiddenProductSchema.index({ hiddenAt: -1 });

export const HiddenProduct = mongoose.model<IHiddenProduct>('HiddenProduct', HiddenProductSchema);