import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Notification = model('Notification', notificationSchema);
