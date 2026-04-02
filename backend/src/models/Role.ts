import { Schema, model } from 'mongoose';

const roleSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Role = model('Role', roleSchema);
