import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { Branch } from '../models/Branch.js';
import { AuditLog } from '../models/AuditLog.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, roleId, status, page = '1', limit = '10' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = {};
  if (roleId) where.roleId = parseInt(roleId);
  if (status) where.status = status;
  if (search) where[Op.or as symbol] = [{ name: { [Op.iLike]: `%${search}%` } }, { email: { [Op.iLike]: `%${search}%` } }];

  const { rows: users, count: total } = await User.findAndCountAll({
    where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
  });

  const [roles, branches] = await Promise.all([Role.findAll(), Branch.findAll()]);
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
  const user = await User.findOne({ where: { id: parseInt(req.params.id) } });
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

  const role = await Role.findOne({ where: { id: user.roleId } });
  const { passwordHash: _ph, ...safe } = user.toJSON() as Record<string, unknown>;
  res.json({ success: true, data: { ...safe, roleName: role?.name } });
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, roleId, branchId, phone } = req.body;
  if (!name || !email || !password || !roleId) {
    res.status(400).json({ success: false, message: 'name, email, password and roleId are required' });
    return;
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) { res.status(400).json({ success: false, message: 'Email already in use' }); return; }

  const role = await Role.findOne({ where: { id: parseInt(roleId) } });
  const newUser = await User.create({
    name, email,
    passwordHash: bcrypt.hashSync(password, 10),
    roleId: parseInt(roleId), roleName: role?.name,
    branchId: branchId ? parseInt(branchId) : undefined,
    phone, status: 'active', createdAt: new Date(),
  });

  const { passwordHash: _ph, ...safe } = newUser.toJSON() as Record<string, unknown>;
  res.status(201).json({ success: true, data: safe, message: 'User created successfully' });
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findOne({ where: { id: parseInt(req.params.id) } });
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

  const { password, ...rest } = req.body;
  const updates: Record<string, unknown> = { ...rest };
  if (password) updates.passwordHash = bcrypt.hashSync(password, 10);
  await user.update(updates);

  const { passwordHash: _ph, ...safe } = user.toJSON() as Record<string, unknown>;
  res.json({ success: true, data: safe, message: 'User updated successfully' });
};

export const deactivate = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findOne({ where: { id: parseInt(req.params.id) } });
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  await user.update({ status: newStatus });
  res.json({ success: true, message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'}` });
};

export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const logs = await AuditLog.findAll({ where: { userId: parseInt(req.params.id) } });
  res.json({ success: true, data: logs });
};
