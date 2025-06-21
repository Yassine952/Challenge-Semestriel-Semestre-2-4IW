import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Cart from './Cart.js'; 
const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
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
  shippingAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ROLE_USER',
  },
  // Préférences d'alertes email
  alertNewProducts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  alertRestock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  alertPriceChanges: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  alertNewsletter: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Catégories d'intérêt pour les alertes (JSON array)
  alertCategories: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

export default User;
