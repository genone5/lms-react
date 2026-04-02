import { Response } from 'express';
import { Settings } from '../models/Settings.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getLabInfo = async (_req: AuthRequest, res: Response): Promise<void> => {
  const settings = await Settings.findOne({ type: 'lab' });
  res.json({ success: true, data: settings?.data || {} });
};

export const updateLabInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  const settings = await Settings.findOneAndUpdate(
    { type: 'lab' },
    { $set: { data: req.body } },
    { new: true, upsert: true }
  );
  res.json({ success: true, data: settings?.data, message: 'Lab information updated' });
};

export const getEmailSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  const settings = await Settings.findOne({ type: 'email' });
  res.json({ success: true, data: settings?.data || {} });
};

export const updateEmailSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const settings = await Settings.findOneAndUpdate(
    { type: 'email' },
    { $set: { data: req.body } },
    { new: true, upsert: true }
  );
  res.json({ success: true, data: settings?.data, message: 'Email settings updated' });
};
