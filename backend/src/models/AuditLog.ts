import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: Number },
  timestamp: { type: String, default: () => new Date().toISOString() },
}, {
  toJSON: {
    transform(_doc, ret) { delete ret._id; delete ret.__v; return ret; },
  },
});

export const AuditLog = model('AuditLog', auditLogSchema);
