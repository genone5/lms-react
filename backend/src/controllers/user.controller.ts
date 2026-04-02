import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { Branch } from '../models/Branch.js';
import { AuditLog } from '../models/AuditLog.js';
import { getNextId } from '../db/counter.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, roleId, status, page = '1', limit = '10' } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (roleId) filter.roleId = parseInt(roleId);
  if (status) filter.status = status;
  if (search) {
    const q = new RegExp(search, 'i');
    filter.$or = [{ name: q }, { email: q }];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  const [roles, branches] = await Promise.all([Role.find({}), Branch.find({})]);

  const data = users.map(u => ({
    id: u.id, name: u.name, email: u.email, roleId: u.roleId,
    roleName: roles.find(r => r.id === u.roleId)?.name,
    branchId: u.branchId,
    branchName: branches.find(b => b.id === u.branchId)?.name,
    phone: u.phone, status: u.status, createdAt: u.createdAt,
  }));

  res.json({ success: true, data, total });
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findOne({ id: parseInt(req.params.id) });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  const role = await Role.findOne({ id: user.roleId });
  const { passwordHash: _ph, ...safeUser } = user.toJSON();
  res.json({ success: true, data: { ...safeUser, roleName: role?.name } });
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, roleId, branchId, phone } = req.body;
  if (!name || !email || !password || !roleId) {
    res.status(400).json({ success: false, message: 'name, email, password and roleId are required' });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ success: false, message: 'Email already in use' });
    return;
  }

  const role = await Role.findOne({ id: parseInt(roleId) });
  const newUser = new User({
    id: await getNextId('user'),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    roleId: parseInt(roleId),
    roleName: role?.name,
    branchId: branchId ? parseInt(branchId) : undefined,
    phone,
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  await newUser.save();
  const { passwordHash: _ph, ...safeUser } = newUser.toJSON();
  res.status(201).json({ success: true, data: safeUser, message: 'User created successfully' });
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findOne({ id: parseInt(req.params.id) });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  const { password, ...rest } = req.body;
  Object.assign(user, rest);
  if (password) user.passwordHash = bcrypt.hashSync(password, 10);
  await user.save();
  const { passwordHash: _ph, ...safeUser } = user.toJSON();
  res.json({ success: true, data: safeUser, message: 'User updated successfully' });
};

export const deactivate = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findOne({ id: parseInt(req.params.id) });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  user.status = user.status === 'active' ? 'inactive' : 'active';
  await user.save();
  res.json({ success: true, message: `User ${user.status === 'active' ? 'activated' : 'deactivated'}` });
};

export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const logs = await AuditLog.find({ userId: parseInt(req.params.id) });
  res.json({ success: true, data: logs });
};
