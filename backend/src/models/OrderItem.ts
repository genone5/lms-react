import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  orderId: { type: Number, required: true },
  testId: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'collected', 'processing', 'completed'], default: 'pending' },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const OrderItem = model('OrderItem', orderItemSchema);
