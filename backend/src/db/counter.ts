import { Schema, model } from 'mongoose';

const counterSchema = new Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

const Counter = model('Counter', counterSchema);

export async function getNextId(entity: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    entity,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter!.seq;
}

export async function setCounterTo(entity: string, value: number): Promise<void> {
  await Counter.findByIdAndUpdate(entity, { seq: value }, { upsert: true });
}
