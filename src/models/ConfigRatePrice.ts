import mongoose from "mongoose";

const RateConfigSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  rateMultiplier: {
    type: Number,
    required: false,
    default: null,
    min: 0.1,
    max: 5.0,
  },
  customPrice: {
    type: Number,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    default: "",
  },
  isGlobal: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  percentage: {
    type: Number,
    default: 0,
    min: -100,
    max: 1000,
  },
  fixedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

RateConfigSchema.index(
  { productId: 1, isGlobal: 1 },
  { unique: true, sparse: true },
);

RateConfigSchema.pre("save", function (this: any, next: any) {
  this.updatedAt = new Date();
  next();
});

export const RateConfig =
  mongoose.models.RateConfig || mongoose.model("RateConfig", RateConfigSchema);