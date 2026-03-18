import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  detail: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  productIds: [{
    type: String,
    required: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

CategorySchema.pre("save", function (this: any, next: any) {
  this.updatedAt = new Date();
});

CategorySchema.index({ title: 1 }, { unique: true });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ order: 1 });

export const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);