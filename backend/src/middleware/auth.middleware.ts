import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthTokenPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lms-secret-key-2024';

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.roleName)) {
      res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
};
