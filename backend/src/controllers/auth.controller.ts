import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users, roles } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lms-secret-key-2024';

export const login = (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const user = users.find(u => u.email === email);
  if (!user || user.status !== 'active') {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const validPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!validPassword) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const role = roles.find(r => r.id === user.roleId);
  const payload = { userId: user.id, email: user.email, roleId: user.roleId, roleName: role?.name || '' };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role?.name || '',
        roleId: user.roleId,
        branchId: user.branchId,
        phone: user.phone,
      },
    },
    message: 'Login successful',
  });
};

export const getProfile = (req: AuthRequest, res: Response): void => {
  const user = users.find(u => u.id === req.user?.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const role = roles.find(r => r.id === user.roleId);
  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role?.name || '',
      roleId: user.roleId,
      branchId: user.branchId,
      phone: user.phone,
      status: user.status,
    },
  });
};

export const changePassword = (req: AuthRequest, res: Response): void => {
  const { oldPassword, newPassword } = req.body;
  const user = users.find(u => u.id === req.user?.userId);

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const valid = bcrypt.compareSync(oldPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  res.json({ success: true, message: 'Password changed successfully' });
};
