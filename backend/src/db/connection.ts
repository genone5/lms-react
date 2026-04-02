import { Sequelize } from 'sequelize';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://macbook@localhost:5432/lms';

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

export async function connectDB(): Promise<void> {
  await sequelize.authenticate();
  console.log('PostgreSQL connected:', DATABASE_URL);
  // Add new columns without dropping existing data
  await sequelize.sync({ alter: true });
  console.log('Database schema synced');
}
