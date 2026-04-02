import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Report extends Model {
  declare id: number;
  declare orderId: number;
  declare reportUrl: string;
  declare generatedBy: number;
  declare generatedAt: Date;
  declare status: string;
}

Report.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  reportUrl: { type: DataTypes.TEXT },
  generatedBy: { type: DataTypes.INTEGER, field: 'generatedById' },
  generatedAt: { type: DataTypes.DATE },
  status: { type: DataTypes.TEXT, defaultValue: 'final' },
}, { sequelize, tableName: 'Report', timestamps: false });
