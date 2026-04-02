import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Result extends Model {
  declare id: number;
  declare orderItemId: number;
  declare resultValue: string;
  declare unit: string;
  declare normalRange: string;
  declare resultStatus: string;
  declare enteredBy: number;
  declare verifiedBy: number;
  declare createdAt: Date;
}

Result.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderItemId: { type: DataTypes.INTEGER, allowNull: false },
  resultValue: { type: DataTypes.TEXT, allowNull: false },
  unit: { type: DataTypes.TEXT, allowNull: false },
  normalRange: { type: DataTypes.TEXT, allowNull: false },
  resultStatus: { type: DataTypes.TEXT, allowNull: false },
  enteredBy: { type: DataTypes.INTEGER, field: 'enteredById' },
  verifiedBy: { type: DataTypes.INTEGER, field: 'verifiedById' },
  createdAt: { type: DataTypes.DATE },
}, { sequelize, tableName: 'Result', timestamps: false });
