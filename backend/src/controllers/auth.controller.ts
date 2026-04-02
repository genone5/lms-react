import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lms-secret-key-2024';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const user = await User.findOne({ where: { email } });
  if (!user || user.status !== 'active') {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  if (!bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const role = await Role.findOne({ where: { id: user.roleId } });
  const payload = { userId: user.id, email: user.email, roleId: user.roleId, roleName: role?.name || '' };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: role?.name || '', roleId: user.roleId, branchId: user.branchId, phone: user.phone },
    },
    message: 'Login successful',
  });
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findOne({ where: { id: req.user?.userId } });
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

  const role = await Role.findOne({ where: { id: user.roleId } });
  res.json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, role: role?.name || '', roleId: user.roleId, branchId: user.branchId, phone: user.phone, status: user.status },
  });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findOne({ where: { id: req.user?.userId } });
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

  if (!bcrypt.compareSync(oldPassword, user.passwordHash)) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  await user.update({ passwordHash: bcrypt.hashSync(newPassword, 10) });
  res.json({ success: true, message: 'Password changed successfully' });
};
