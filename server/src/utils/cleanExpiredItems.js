import CartItem from '../models/CartItem.js';
import Product from '../../../client/src/models/Product.js';
import Cart from '../../../client/src/models/Cart.js';
import { Op } from 'sequelize';

export const cleanExpiredItems = async (cartId) => {
  const now = new Date();
  const expiredItems = await CartItem.findAll({
    where: {
      cartId,
      reservationExpiry: {
        [Op.lt]: now,
      },
    },
  });

  for (const item of expiredItems) {
    const product = await Product.findByPk(item.productId);
    product.stock += item.quantity;
    await product.save();
    await item.destroy();
  }

  const totalPrice = await CartItem.sum('price', { where: { cartId } });
  await Cart.update({ totalPrice: totalPrice || 0 }, { where: { id: cartId } });
};
