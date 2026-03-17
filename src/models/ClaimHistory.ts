import mongoose, { Document, Schema } from "mongoose";

export interface IClaimHistory extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  externalOrderId: string;
  provider: "wichxshop";

  claimReason: string;
  claimStatus: "PENDING" | "APPROVED" | "REJECTED" | "RESOLVED";
  adminResponse?: string;
  resolvedAt?: Date;

  requestPayload?: unknown;
  responsePayload?: unknown;
  errorCode?: string;
  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ClaimHistorySchema = new Schema<IClaimHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "OrderHistory",
      required: true,
    },
    externalOrderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ["wichxshop"],
      default: "wichxshop",
    },
    claimReason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    claimStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "APPROVED", "REJECTED", "RESOLVED"],
      default: "PENDING",
      index: true,
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    resolvedAt: {
      type: Date,
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

ClaimHistorySchema.index({ userId: 1, createdAt: -1 });
ClaimHistorySchema.index({ orderId: 1 });
ClaimHistorySchema.index({ externalOrderId: 1 });
ClaimHistorySchema.index({ claimStatus: 1 });

export const ClaimHistory = mongoose.model<IClaimHistory>(
  "ClaimHistory",
  ClaimHistorySchema,
);
