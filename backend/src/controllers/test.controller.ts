import { Response } from 'express';
import { Op } from 'sequelize';
import { Test } from '../models/Test.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, category, page = '1', limit = '10' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (search) where[Op.or as symbol] = [{ name: { [Op.iLike]: `%${search}%` } }, { category: { [Op.iLike]: `%${search}%` } }];

  const { rows: data, count: total } = await Test.findAndCountAll({
    where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({ success: true, data, total, page: parseInt(page), limit: parseInt(limit) });
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const test = await Test.findOne({ where: { id: parseInt(req.params.id) } });
  if (!test) { res.status(404).json({ success: false, message: 'Test not found' }); return; }
  res.json({ success: true, data: test });
};

export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  const rows = await Test.findAll({ attributes: ['category'], group: ['category'] });
  res.json({ success: true, data: rows.map(r => r.category) });
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, category, price, sampleType, normalRange } = req.body;
  if (!name || !category || price === undefined || !sampleType) {
    res.status(400).json({ success: false, message: 'name, category, price and sampleType are required' });
    return;
  }
  const newTest = await Test.create({ name, category, price: parseFloat(price), sampleType, normalRange, createdAt: new Date() });
  res.status(201).json({ success: true, data: newTest, message: 'Test created successfully' });
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const test = await Test.findOne({ where: { id: parseInt(req.params.id) } });
  if (!test) { res.status(404).json({ success: false, message: 'Test not found' }); return; }
  await test.update(req.body);
  res.json({ success: true, data: test, message: 'Test updated successfully' });
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  const test = await Test.findOne({ where: { id: parseInt(req.params.id) } });
  if (!test) { res.status(404).json({ success: false, message: 'Test not found' }); return; }
  await test.destroy();
  res.json({ success: true, message: 'Test deleted successfully' });
};
