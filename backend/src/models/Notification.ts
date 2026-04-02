import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Notification extends Model {
  declare id: number;
  declare userId: number;
  declare message: string;
  declare status: string;
  declare createdAt: Date;
}

Notification.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.TEXT, defaultValue: 'unread' },
  createdAt: { type: DataTypes.DATE },
}, { sequelize, tableName: 'Notification', timestamps: false });
