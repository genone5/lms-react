import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Settings extends Model {
  declare type: string;
  declare data: Record<string, unknown>;
}

Settings.init({
  type: { type: DataTypes.TEXT, primaryKey: true },
  data: { type: DataTypes.JSONB, allowNull: false },
}, { sequelize, tableName: 'Settings', timestamps: false });
