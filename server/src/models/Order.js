import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Order = sequelize.define('Order', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  originalAmount: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  promoCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  promoDiscount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending'
  },
  returnRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  returnRequestDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  returnReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  returnStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null // 'Requested', 'Approved', 'Denied', 'Processed'
  },
  // Informations de paiement Stripe pour les remboursements
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stripeChargeId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Informations de remboursement
  refundRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  refundAmount: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  refundId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  refundStatus: {
    type: DataTypes.STRING,
    allowNull: true // 'pending', 'succeeded', 'failed'
  },
  refundDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

export default Order;
