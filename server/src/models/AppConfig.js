import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AppConfig = sequelize.define('AppConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  configKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'config_key'
  },
  configValue: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'config_value'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  dataType: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    allowNull: false,
    defaultValue: 'string',
    field: 'data_type'
  }
}, {
  tableName: 'app_config',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default AppConfig; 