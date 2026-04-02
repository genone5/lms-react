import { Schema, model } from 'mongoose';

const resultSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  orderItemId: { type: Number, required: true },
  resultValue: { type: String, required: true },
  unit: { type: String, required: true },
  normalRange: { type: String, required: true },
  resultStatus: { type: String, enum: ['normal', 'abnormal', 'critical'], required: true },
  enteredBy: { type: Number, required: true },
  verifiedBy: { type: Number },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Result = model('Result', resultSchema);
