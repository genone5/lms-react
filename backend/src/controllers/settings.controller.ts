import { Response } from 'express';
import { labSettings, emailSettings } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getLabInfo = (_req: AuthRequest, res: Response): void => {
  res.json({ success: true, data: labSettings });
};

export const updateLabInfo = (req: AuthRequest, res: Response): void => {
  Object.assign(labSettings, req.body);
  res.json({ success: true, data: labSettings, message: 'Lab information updated' });
};

export const getEmailSettings = (_req: AuthRequest, res: Response): void => {
  res.json({ success: true, data: emailSettings });
};

export const updateEmailSettings = (req: AuthRequest, res: Response): void => {
  Object.assign(emailSettings, req.body);
  res.json({ success: true, data: emailSettings, message: 'Email settings updated' });
};
