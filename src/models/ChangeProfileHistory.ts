import mongoose, { Schema, Document } from "mongoose";

export interface IChangeProfileHistory extends Document {
  userId: mongoose.Types.ObjectId;
  fieldType: "username" | "email" | "phone" | "password";
  oldValue?: string;
  newValue?: string;
  changeType: "update" | "delete" | "add";
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failed";
  errorMessage?: string;
  createdAt: Date;
}

const ChangeProfileHistorySchema = new Schema<IChangeProfileHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fieldType: {
    type: String,
    enum: ["username", "email", "phone", "password"],
    required: true,
  },
  oldValue: {
    type: String,
    required: false,
  },
  newValue: {
    type: String,
    required: false,
  },
  changeType: {
    type: String,
    enum: ["update", "delete", "add"],
    required: true,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  userAgent: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true,
  },
  errorMessage: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ChangeProfileHistorySchema.index({ userId: 1, createdAt: -1 });
ChangeProfileHistorySchema.index({ createdAt: -1 });
ChangeProfileHistorySchema.index({ status: 1 });

export const ChangeProfileHistory = mongoose.model<IChangeProfileHistory>("ChangeProfileHistory", ChangeProfileHistorySchema);