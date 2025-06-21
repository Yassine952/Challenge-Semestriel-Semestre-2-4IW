import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Product from './Product.js';

const AlertHistory = sequelize.define('AlertHistory', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Peut être null pour les newsletters
    references: {
      model: Product,
      key: 'id'
    }
  },
  alertType: {
    type: DataTypes.ENUM('new_product', 'restock', 'price_change', 'newsletter', 'low_stock'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true // Pour stocker des infos supplémentaires (ancien prix, nouveau prix, etc.)
  }
}, {
  timestamps: true
});

// Relations
User.hasMany(AlertHistory, { foreignKey: 'userId' });
AlertHistory.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(AlertHistory, { foreignKey: 'productId' });
AlertHistory.belongsTo(Product, { foreignKey: 'productId' });

export default AlertHistory; 