import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Branch extends Model {
  declare id: number;
  declare name: string;
  declare address: string;
  declare city: string;
  declare phone: string;
  declare createdAt: Date;
}

Branch.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.TEXT, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  city: { type: DataTypes.TEXT, allowNull: false },
  phone: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE },
}, { sequelize, tableName: 'Branch', timestamps: false });
