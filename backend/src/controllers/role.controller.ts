import { Response } from 'express';
import { roles } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { Role } from '../types/index.js';

let nextId = roles.length + 1;

export const getAll = (_req: AuthRequest, res: Response): void => {
  res.json({ success: true, data: roles });
};

export const getById = (req: AuthRequest, res: Response): void => {
  const role = roles.find(r => r.id === parseInt(req.params.id));
  if (!role) {
    res.status(404).json({ success: false, message: 'Role not found' });
    return;
  }
  res.json({ success: true, data: role });
};

export const create = (req: AuthRequest, res: Response): void => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Name is required' });
    return;
  }
  const newRole: Role = { id: nextId++, name, description };
  roles.push(newRole);
  res.status(201).json({ success: true, data: newRole, message: 'Role created successfully' });
};

export const update = (req: AuthRequest, res: Response): void => {
  const idx = roles.findIndex(r => r.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Role not found' });
    return;
  }
  roles[idx] = { ...roles[idx], ...req.body };
  res.json({ success: true, data: roles[idx], message: 'Role updated' });
};

export const remove = (req: AuthRequest, res: Response): void => {
  const idx = roles.findIndex(r => r.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Role not found' });
    return;
  }
  roles.splice(idx, 1);
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
