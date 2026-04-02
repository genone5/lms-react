import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class TestOrder extends Model {
  declare id: number;
  declare patientId: number;
  declare doctorName: string;
  declare branchId: number;
  declare status: string;
  declare orderDate: Date;
  declare createdBy: number;
}

TestOrder.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  doctorName: { type: DataTypes.TEXT, allowNull: false },
  branchId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.TEXT, defaultValue: 'pending' },
  orderDate: { type: DataTypes.DATE },
  createdBy: { type: DataTypes.INTEGER, field: 'createdById' },
}, { sequelize, tableName: 'TestOrder', timestamps: false });
