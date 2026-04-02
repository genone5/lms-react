import { Schema, model } from 'mongoose';

const reportSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  orderId: { type: Number, required: true },
  reportUrl: { type: String, default: '' },
  generatedBy: { type: Number, required: true },
  generatedAt: { type: String, default: () => new Date().toISOString() },
  status: { type: String, enum: ['draft', 'final'], default: 'final' },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Report = model('Report', reportSchema);
