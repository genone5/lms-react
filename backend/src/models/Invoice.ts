import { Schema, model } from 'mongoose';

const invoiceSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  orderId: { type: Number, required: true, unique: true },
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'cancelled'], default: 'unpaid' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Invoice = model('Invoice', invoiceSchema);
