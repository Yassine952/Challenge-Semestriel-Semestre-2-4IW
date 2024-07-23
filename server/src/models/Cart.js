import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Cart = sequelize.define('Cart', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  }
});

export default Cart;
