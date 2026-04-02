import { Schema, model } from 'mongoose';

const branchSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Branch = model('Branch', branchSchema);
