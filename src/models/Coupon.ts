import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  amount: number;
  usageType: 'single' | 'multi' | 'unlimited';
  maxUsage?: number;
  currentUsage: number;
  usedBy: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive' | 'expired';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  usageType: {
    type: String,
    required: true,
    enum: ['single', 'multi', 'unlimited'],
    default: 'single'
  },
  maxUsage: {
    type: Number,
    min: 1
  },
  currentUsage: {
    type: Number,
    default: 0,
    min: 0
  },
  usedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ status: 1 });
CouponSchema.index({ expiresAt: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
