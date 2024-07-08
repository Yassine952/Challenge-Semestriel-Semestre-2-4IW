// server/src/models/User.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Assurez-vous que le chemin est correct

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  passwordLastChanged: {
    type: DataTypes.DATE,
  },
  passwordNeedsReset: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default User;
