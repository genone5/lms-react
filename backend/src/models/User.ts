import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare roleId: number;
  declare roleName: string;
  declare branchId: number;
  declare phone: string;
  declare status: string;
  declare createdAt: Date;
}

User.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.TEXT, allowNull: false },
  roleId: { type: DataTypes.INTEGER },
  roleName: { type: DataTypes.TEXT },
  branchId: { type: DataTypes.INTEGER },
  phone: { type: DataTypes.TEXT },
  status: { type: DataTypes.TEXT, defaultValue: 'active' },
  createdAt: { type: DataTypes.DATE },
}, { sequelize, tableName: 'User', timestamps: false });
