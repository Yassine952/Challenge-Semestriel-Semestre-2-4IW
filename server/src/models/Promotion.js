import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Promotion = sequelize.define('Promotion', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  discountValue: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  minOrderAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  maxDiscountAmount: {
    type: DataTypes.FLOAT,
    allowNull: true // null = pas de limite
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true // null = illimité
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applicationType: {
    type: DataTypes.ENUM('all', 'category', 'product'),
    allowNull: false,
    defaultValue: 'all'
  },
  applicableCategories: {
    type: DataTypes.JSON, // Array de catégories
    allowNull: true
  },
  applicableProductIds: {
    type: DataTypes.JSON, // Array d'IDs de produits
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    {
      fields: ['code']
    },
    {
      fields: ['startDate', 'endDate']
    },
    {
      fields: ['isActive']
    }
  ]
});

export default Promotion; 