import { Response } from 'express';
import { Branch } from '../models/Branch.js';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (_req: AuthRequest, res: Response): Promise<void> => {
  const branches = await Branch.findAll();
  res.json({ success: true, data: branches });
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const branch = await Branch.findOne({ where: { id: parseInt(req.params.id) } });
  if (!branch) { res.status(404).json({ success: false, message: 'Branch not found' }); return; }
  res.json({ success: true, data: branch });
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, address, city, phone } = req.body;
  if (!name || !address || !city) {
    res.status(400).json({ success: false, message: 'name, address and city are required' });
    return;
  }
  const newBranch = await Branch.create({ name, address, city, phone, createdAt: new Date() });
  res.status(201).json({ success: true, data: newBranch, message: 'Branch created successfully' });
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const branch = await Branch.findOne({ where: { id: parseInt(req.params.id) } });
  if (!branch) { res.status(404).json({ success: false, message: 'Branch not found' }); return; }
  await branch.update(req.body);
  res.json({ success: true, data: branch, message: 'Branch updated' });
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  const branch = await Branch.findOne({ where: { id: parseInt(req.params.id) } });
  if (!branch) { res.status(404).json({ success: false, message: 'Branch not found' }); return; }
  await branch.destroy();
  res.json({ success: true, message: 'Branch deleted' });
};

export const getStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.findAll({ where: { branchId: parseInt(req.params.id) } });
  const roles = await Role.findAll();
  const staff = users.map(u => ({
    id: u.id, name: u.name, email: u.email,
    roleName: roles.find(r => r.id === u.roleId)?.name,
    status: u.status,
  }));
  res.json({ success: true, data: staff });
};
