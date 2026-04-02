import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class OrderItem extends Model {
  declare id: number;
  declare orderId: number;
  declare testId: number;
  declare price: number;
  declare status: string;
}

OrderItem.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  testId: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.TEXT, defaultValue: 'pending' },
}, { sequelize, tableName: 'OrderItem', timestamps: false });
