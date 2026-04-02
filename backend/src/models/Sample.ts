import { Schema, model } from 'mongoose';

const sampleSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  orderItemId: { type: Number, required: true },
  sampleType: { type: String, required: true },
  collectedBy: { type: Number, required: true },
  collectionTime: { type: String, default: () => new Date().toISOString() },
  status: { type: String, enum: ['collected', 'in_lab', 'processing', 'completed'], default: 'collected' },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Sample = model('Sample', sampleSchema);
