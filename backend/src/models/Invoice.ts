import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Invoice extends Model {
  declare id: number;
  declare orderId: number;
  declare totalAmount: number;
  declare discount: number;
  declare tax: number;
  declare netAmount: number;
  declare status: string;
  declare branchId: number;
  declare createdAt: Date;
}

Invoice.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  netAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.TEXT, defaultValue: 'unpaid' },
  branchId: { type: DataTypes.INTEGER },
  createdAt: { type: DataTypes.DATE },
}, { sequelize, tableName: 'Invoice', timestamps: false });
