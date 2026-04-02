import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class AuditLog extends Model {
  declare id: number;
  declare userId: number;
  declare action: string;
  declare entityType: string;
  declare entityId: number;
  declare timestamp: Date;
}

AuditLog.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.TEXT, allowNull: false },
  entityType: { type: DataTypes.TEXT, allowNull: false },
  entityId: { type: DataTypes.INTEGER },
  timestamp: { type: DataTypes.DATE },
}, { sequelize, tableName: 'AuditLog', timestamps: false });
