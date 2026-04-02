import { Schema, model } from 'mongoose';

const settingsSchema = new Schema({
  type: { type: String, required: true, unique: true }, // 'lab' | 'email'
  data: { type: Schema.Types.Mixed, required: true },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Settings = model('Settings', settingsSchema);
