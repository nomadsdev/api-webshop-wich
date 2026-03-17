import mongoose, { Document, Schema } from 'mongoose';

export interface IImageSlide extends Document {
  title: string;
  imageUrl: string;
  link?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSlideSchema = new Schema<IImageSlide>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});


ImageSlideSchema.index({ order: 1 });

export const ImageSlide = mongoose.model<IImageSlide>('ImageSlide', ImageSlideSchema);
