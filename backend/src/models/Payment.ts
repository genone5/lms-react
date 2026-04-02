import { Schema, model } from 'mongoose';

const paymentSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  invoiceId: { type: Number, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online', 'insurance'], required: true },
  paymentDate: { type: String, default: () => new Date().toISOString() },
  receivedBy: { type: Number, required: true },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Payment = model('Payment', paymentSchema);
