import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { connectDB } from './db/connection.js';
import { apiRouter } from './routes/api.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const port = Number(process.env.PORT || 5001);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`LMS Backend running on http://localhost:${port}`);
    console.log(`API base: http://localhost:${port}/api/v1`);
    console.log('\nDefault login: admin@lms.com / admin123');
  });
});
