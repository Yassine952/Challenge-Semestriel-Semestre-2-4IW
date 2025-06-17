import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Product from './Product.js';
import User from './User.js';

const StockHistory = sequelize.define('StockHistory', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  movementType: {
    type: DataTypes.ENUM(
      'purchase',
      'sale',
      'adjustment',
      'return',
      'reservation',
      'release',
      'damage',
      'theft',
      'transfer',
      'initial'
    ),
    allowNull: false
  },
  quantityBefore: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantityChange: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantityAfter: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['productId', 'createdAt']
    },
    {
      fields: ['movementType']
    },
    {
      fields: ['createdAt']
    }
  ]
});

Product.hasMany(StockHistory, { foreignKey: 'productId' });
StockHistory.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(StockHistory, { foreignKey: 'userId' });
StockHistory.belongsTo(User, { foreignKey: 'userId' });

export default StockHistory; 