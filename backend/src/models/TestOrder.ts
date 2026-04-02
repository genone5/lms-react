import { Schema, model } from 'mongoose';

const testOrderSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  patientId: { type: Number, required: true },
  doctorName: { type: String, required: true },
  branchId: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'sample_collected', 'processing', 'completed', 'cancelled'], default: 'pending' },
  orderDate: { type: String, default: () => new Date().toISOString() },
  createdBy: { type: Number, required: true },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const TestOrder = model('TestOrder', testOrderSchema);
