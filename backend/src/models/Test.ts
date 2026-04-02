import { Schema, model } from 'mongoose';

const testSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  sampleType: { type: String, required: true },
  normalRange: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Test = model('Test', testSchema);
