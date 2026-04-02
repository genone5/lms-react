import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Role extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
}

Role.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT },
}, { sequelize, tableName: 'Role', timestamps: false });
