import { Response } from 'express';
import { branches, users, roles } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { Branch } from '../types/index.js';

let nextId = branches.length + 1;

export const getAll = (_req: AuthRequest, res: Response): void => {
  res.json({ success: true, data: branches });
};

export const getById = (req: AuthRequest, res: Response): void => {
  const branch = branches.find(b => b.id === parseInt(req.params.id));
  if (!branch) {
    res.status(404).json({ success: false, message: 'Branch not found' });
    return;
  }
  res.json({ success: true, data: branch });
};

export const create = (req: AuthRequest, res: Response): void => {
  const { name, address, city, phone } = req.body;
  if (!name || !address || !city) {
    res.status(400).json({ success: false, message: 'name, address and city are required' });
    return;
  }
  const newBranch: Branch = { id: nextId++, name, address, city, phone, createdAt: new Date().toISOString() };
  branches.push(newBranch);
  res.status(201).json({ success: true, data: newBranch, message: 'Branch created successfully' });
};

export const update = (req: AuthRequest, res: Response): void => {
  const idx = branches.findIndex(b => b.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Branch not found' });
    return;
  }
  branches[idx] = { ...branches[idx], ...req.body };
  res.json({ success: true, data: branches[idx], message: 'Branch updated' });
};

export const remove = (req: AuthRequest, res: Response): void => {
  const idx = branches.findIndex(b => b.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Branch not found' });
    return;
  }
  branches.splice(idx, 1);
  res.json({ success: true, message: 'Branch deleted' });
};

export const getStaff = (req: AuthRequest, res: Response): void => {
  const branchId = parseInt(req.params.id);
  const staff = users
    .filter(u => u.branchId === branchId)
    .map(u => ({ id: u.id, name: u.name, email: u.email, roleName: roles.find(r => r.id === u.roleId)?.name, status: u.status }));
  res.json({ success: true, data: staff });
};
