import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Test extends Model {
  declare id: number;
  declare name: string;
  declare category: string;
  declare price: number;
  declare sampleType: string;
  declare normalRange: string;
  declare createdAt: Date;
}

Test.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  sampleType: { type: DataTypes.TEXT, allowNull: false },
  normalRange: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE },
}, { sequelize, tableName: 'Test', timestamps: false });
