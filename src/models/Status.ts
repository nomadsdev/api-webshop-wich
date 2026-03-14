import mongoose, { Document, Schema } from 'mongoose';

export interface IStatus extends Document {
  title: string; // ชื่อสถิติ (ภาษาไทย)
  subtitle: string; // คำบรรยาย (ภาษาอังกฤษ)
  count: string; // จำนวน (เช่น "2.5k", "150", etc.)
  unit: string; // หน่วย (เช่น "คน", "รายการ", "บาท")
  order: number; // ลำดับการแสดง (1-4)
  isActive: boolean; // สถานะการแสดง
  createdAt: Date;
  updatedAt: Date;
}

const StatusSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index สำหรับประสิทธิภาพ
StatusSchema.index({ order: 1 }, { unique: true });
StatusSchema.index({ isActive: 1 });

export default mongoose.model<IStatus>('Status', StatusSchema);







