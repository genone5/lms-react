import { Response } from 'express';
import { Test } from '../models/Test.js';
import { getNextId } from '../db/counter.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, category, page = '1', limit = '10' } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { category: new RegExp(search, 'i') }];

  const total = await Test.countDocuments(filter);
  const data = await Test.find(filter)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  res.json({ success: true, data, total, page: parseInt(page), limit: parseInt(limit) });
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const test = await Test.findOne({ id: parseInt(req.params.id) });
  if (!test) {
    res.status(404).json({ success: false, message: 'Test not found' });
    return;
  }
  res.json({ success: true, data: test });
};

export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  const categories = await Test.distinct('category');
  res.json({ success: true, data: categories });
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, category, price, sampleType, normalRange } = req.body;
  if (!name || !category || price === undefined || !sampleType) {
    res.status(400).json({ success: false, message: 'name, category, price and sampleType are required' });
    return;
  }

  const newTest = new Test({
    id: await getNextId('test'),
    name, category,
    price: parseFloat(price),
    sampleType, normalRange,
    createdAt: new Date().toISOString(),
  });

  await newTest.save();
  res.status(201).json({ success: true, data: newTest, message: 'Test created successfully' });
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const test = await Test.findOne({ id: parseInt(req.params.id) });
  if (!test) {
    res.status(404).json({ success: false, message: 'Test not found' });
    return;
  }
  Object.assign(test, req.body);
  await test.save();
  res.json({ success: true, data: test, message: 'Test updated successfully' });
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  const test = await Test.findOneAndDelete({ id: parseInt(req.params.id) });
  if (!test) {
    res.status(404).json({ success: false, message: 'Test not found' });
    return;
  }
  res.json({ success: true, message: 'Test deleted successfully' });
};
