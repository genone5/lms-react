import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Sample extends Model {
  declare id: number;
  declare orderItemId: number;
  declare sampleType: string;
  declare collectedBy: number;
  declare collectionTime: Date;
  declare status: string;
}

Sample.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderItemId: { type: DataTypes.INTEGER, allowNull: false },
  sampleType: { type: DataTypes.TEXT, allowNull: false },
  collectedBy: { type: DataTypes.INTEGER, field: 'collectedById' },
  collectionTime: { type: DataTypes.DATE },
  status: { type: DataTypes.TEXT, defaultValue: 'collected' },
}, { sequelize, tableName: 'Sample', timestamps: false });
