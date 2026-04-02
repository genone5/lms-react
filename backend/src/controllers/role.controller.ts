import { Response } from 'express';
import { Role } from '../models/Role.js';
import { getNextId } from '../db/counter.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (_req: AuthRequest, res: Response): Promise<void> => {
  const roles = await Role.find({});
  res.json({ success: true, data: roles });
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const role = await Role.findOne({ id: parseInt(req.params.id) });
  if (!role) {
    res.status(404).json({ success: false, message: 'Role not found' });
    return;
  }
  res.json({ success: true, data: role });
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Name is required' });
    return;
  }
  const newRole = new Role({ id: await getNextId('role'), name, description });
  await newRole.save();
  res.status(201).json({ success: true, data: newRole, message: 'Role created successfully' });
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const role = await Role.findOne({ id: parseInt(req.params.id) });
  if (!role) {
    res.status(404).json({ success: false, message: 'Role not found' });
    return;
  }
  Object.assign(role, req.body);
  await role.save();
  res.json({ success: true, data: role, message: 'Role updated' });
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  const role = await Role.findOneAndDelete({ id: parseInt(req.params.id) });
  if (!role) {
    res.status(404).json({ success: false, message: 'Role not found' });
    return;
  }
  res.json({ success: true, message: 'Role deleted' });
};

export const getPermissionMatrix = (_req: AuthRequest, res: Response): void => {
  const matrix = {
    Admin: { patients: ['read','create','update','delete'], tests: ['read','create','update','delete'], orders: ['read','create','update','delete'], samples: ['read','create','update'], results: ['read','create','update','verify'], billing: ['read','create','update'], users: ['read','create','update','delete'], reports: ['read','generate'] },
    Doctor: { patients: ['read'], tests: ['read'], orders: ['read','create'], samples: [], results: ['read','verify'], billing: [], users: [], reports: ['read','generate'] },
    'Lab Technician': { patients: ['read'], tests: ['read'], orders: ['read'], samples: ['read','create','update'], results: ['read','create','update'], billing: [], users: [], reports: ['read'] },
    Receptionist: { patients: ['read','create','update'], tests: [], orders: ['read','create'], samples: ['read','create'], results: [], billing: ['read','create'], users: [], reports: [] },
    Accountant: { patients: [], tests: [], orders: [], samples: [], results: [], billing: ['read','create','update'], users: [], reports: [] },
  };
  res.json({ success: true, data: matrix });
};
