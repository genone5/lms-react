import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Payment extends Model {
  declare id: number;
  declare invoiceId: number;
  declare amount: number;
  declare paymentMethod: string;
  declare paymentDate: Date;
  declare receivedBy: number;
}

Payment.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoiceId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentMethod: { type: DataTypes.TEXT, allowNull: false },
  paymentDate: { type: DataTypes.DATE },
  receivedBy: { type: DataTypes.INTEGER, field: 'receivedById' },
}, { sequelize, tableName: 'Payment', timestamps: false });
