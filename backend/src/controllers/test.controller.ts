import { Response } from 'express';
import { tests } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { Test } from '../types/index.js';

let nextId = tests.length + 1;

export const getAll = (req: AuthRequest, res: Response): void => {
  const { search, category, page = '1', limit = '10' } = req.query as Record<string, string>;
  let data = [...tests];

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }
  if (category) data = data.filter(t => t.category === category);

  const total = data.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paged = data.slice(start, start + parseInt(limit));

  res.json({ success: true, data: paged, total, page: parseInt(page), limit: parseInt(limit) });
};

export const getById = (req: AuthRequest, res: Response): void => {
  const test = tests.find(t => t.id === parseInt(req.params.id));
  if (!test) {
    res.status(404).json({ success: false, message: 'Test not found' });
    return;
  }
  res.json({ success: true, data: test });
};

export const getCategories = (_req: AuthRequest, res: Response): void => {
  const categories = [...new Set(tests.map(t => t.category))];
  res.json({ success: true, data: categories });
};

export const create = (req: AuthRequest, res: Response): void => {
  const { name, category, price, sampleType, normalRange } = req.body;
  if (!name || !category || price === undefined || !sampleType) {
    res.status(400).json({ success: false, message: 'name, category, price and sampleType are required' });
    return;
  }

  const newTest: Test = {
    id: nextId++,
    name,
    category,
    price: parseFloat(price),
    sampleType,
    normalRange,
    createdAt: new Date().toISOString(),
  };

  tests.push(newTest);
  res.status(201).json({ success: true, data: newTest, message: 'Test created successfully' });
};

export const update = (req: AuthRequest, res: Response): void => {
  const idx = tests.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Test not found' });
    return;
  }
  tests[idx] = { ...tests[idx], ...req.body };
  res.json({ success: true, data: tests[idx], message: 'Test updated successfully' });
};

export const remove = (req: AuthRequest, res: Response): void => {
  const idx = tests.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Test not found' });
    return;
  }
  tests.splice(idx, 1);
  res.json({ success: true, message: 'Test deleted successfully' });
};
