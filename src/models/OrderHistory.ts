import mongoose, { Document, Schema } from "mongoose";

export interface IOrderHistory extends Document {
  userId: mongoose.Types.ObjectId;
  provider: "wichxshop";

  externalOrderId?: string;
  productId: string;
  productName?: string;
  productPrice?: number;
  quantity: number;
  totalPrice?: number;
  keys?: string;

  pointsBefore?: number;
  pointsDeducted?: number;
  pointsAfter?: number;

  status: "success" | "failed" | "pending";
  requestPayload?: unknown;
  responsePayload?: unknown;
  errorCode?: string;
  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrderHistorySchema = new Schema<IOrderHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ["wichxshop"],
      default: "wichxshop",
    },
    externalOrderId: {
      type: String,
      trim: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    productName: {
      type: String,
      trim: true,
    },
    productPrice: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
    },
    keys: {
      type: String,
    },
    pointsBefore: {
      type: Number,
    },
    pointsDeducted: {
      type: Number,
    },
    pointsAfter: {
      type: Number,
    },
    status: {
      type: String,
      required: true,
      enum: ["success", "failed", "pending"],
      default: "pending",
      index: true,
    },
    requestPayload: {
      type: Schema.Types.Mixed,
    },
    responsePayload: {
      type: Schema.Types.Mixed,
    },
    errorCode: {
      type: String,
      trim: true,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

OrderHistorySchema.index({ userId: 1, createdAt: -1 });
OrderHistorySchema.index(
  { provider: 1, externalOrderId: 1 },
  { unique: true, sparse: true }
);

export const OrderHistory = mongoose.model<IOrderHistory>(
  "OrderHistory",
  OrderHistorySchema,
);
