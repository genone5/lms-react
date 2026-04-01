import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { users, roles, branches, auditLogs } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { User } from '../types/index.js';

let nextId = users.length + 1;

export const getAll = (req: AuthRequest, res: Response): void => {
  const { search, roleId, status, page = '1', limit = '10' } = req.query as Record<string, string>;
  let data = users.map(u => ({
    id: u.id, name: u.name, email: u.email, roleId: u.roleId,
    roleName: roles.find(r => r.id === u.roleId)?.name,
    branchId: u.branchId,
    branchName: branches.find(b => b.id === u.branchId)?.name,
    phone: u.phone, status: u.status, createdAt: u.createdAt,
  }));

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  if (roleId) data = data.filter(u => u.roleId === parseInt(roleId));
  if (status) data = data.filter(u => u.status === status);

  const total = data.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  res.json({ success: true, data: data.slice(start, start + parseInt(limit)), total });
};

export const getById = (req: AuthRequest, res: Response): void => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, data: { ...safeUser, roleName: roles.find(r => r.id === user.roleId)?.name } });
};

export const create = (req: AuthRequest, res: Response): void => {
  const { name, email, password, roleId, branchId, phone } = req.body;
  if (!name || !email || !password || !roleId) {
    res.status(400).json({ success: false, message: 'name, email, password and roleId are required' });
    return;
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    res.status(400).json({ success: false, message: 'Email already in use' });
    return;
  }

  const newUser: User = {
    id: nextId++,
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    roleId: parseInt(roleId),
    roleName: roles.find(r => r.id === parseInt(roleId))?.name,
    branchId: branchId ? parseInt(branchId) : undefined,
    phone,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({ success: true, data: safeUser, message: 'User created successfully' });
};

export const update = (req: AuthRequest, res: Response): void => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  const { password, ...rest } = req.body;
  users[idx] = { ...users[idx], ...rest };
  if (password) users[idx].passwordHash = bcrypt.hashSync(password, 10);
  const { passwordHash: _, ...safeUser } = users[idx];
  res.json({ success: true, data: safeUser, message: 'User updated successfully' });
};

export const deactivate = (req: AuthRequest, res: Response): void => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  users[idx].status = users[idx].status === 'active' ? 'inactive' : 'active';
  res.json({ success: true, message: `User ${users[idx].status === 'active' ? 'activated' : 'deactivated'}` });
};

export const getActivityLogs = (req: AuthRequest, res: Response): void => {
  const userId = parseInt(req.params.id);
  const logs = auditLogs.filter(l => l.userId === userId);
  res.json({ success: true, data: logs });
};
