import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/connection.js';

export class Patient extends Model {
  declare id: number;
  declare firstName: string;
  declare lastName: string;
  declare gender: string;
  declare dateOfBirth: Date;
  declare age: number;
  declare idCardNumber: string;
  declare phone: string;
  declare email: string;
  declare address: string;
  declare bloodGroup: string;
  declare emergencyContact: string;
  declare createdAt: Date;
}

Patient.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.TEXT, allowNull: false },
  lastName: { type: DataTypes.TEXT, allowNull: false },
  gender: { type: DataTypes.TEXT },
  dateOfBirth: { type: DataTypes.DATE },
  age: { type: DataTypes.INTEGER },
  idCardNumber: { type: DataTypes.TEXT },
  phone: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT },
  address: { type: DataTypes.TEXT },
  bloodGroup: { type: DataTypes.TEXT },
  emergencyContact: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE },
}, { sequelize, tableName: 'Patient', timestamps: false });
