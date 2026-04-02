import { Schema, model } from 'mongoose';

const patientSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  dateOfBirth: { type: String },
  age: { type: Number },
  idCardNumber: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  bloodGroup: { type: String },
  emergencyContact: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const Patient = model('Patient', patientSchema);
