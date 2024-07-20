import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';
import cron from 'node-cron';

const RESERVATION_TIME = 1 * 60 * 1000; // 1 minute in milliseconds

export const cleanExpiredItems = async () => {
  const now = new Date();
  const expiredItems = await CartItem.findAll({
    where: {
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

  const cartIds = [...new Set(expiredItems.map(item => item.cartId))];
  for (const cartId of cartIds) {
    const totalPrice = await CartItem.sum('price', { where: { cartId } });
    await Cart.update({ totalPrice: totalPrice || 0 }, { where: { id: cartId } });
  }
};

// Planifier une tâche cron pour exécuter cleanExpiredItems toutes les minutes
cron.schedule('* * * * *', cleanExpiredItems);

// Obtenir le panier de l'utilisateur
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const cart = await Cart.findOne({ 
      where: { userId }, 
      include: {
        model: CartItem,
        include: [Product]
      }
    });

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Ajouter un produit au panier
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is missing' });
  }

  try {
    let cart = await Cart.findOne({ where: { userId } });

    if (!cart) {
      cart = await Cart.create({ userId, totalPrice: 0 });
    }

    await cleanExpiredItems(cart.id);

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Quantité insuffisante en stock' });
    }

    const expiryTime = new Date(Date.now() + RESERVATION_TIME);

    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.price = cartItem.quantity * product.price;
      cartItem.reservationExpiry = expiryTime;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price * quantity,
        reservationExpiry: expiryTime,
      });
    }

    product.stock -= quantity;
    await product.save();

    cart.totalPrice = await CartItem.sum('price', { where: { cartId: cart.id } });
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un produit du panier
export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is missing' });
  }

  try {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!cartItem) {
      return res.status(404).json({ message: 'Produit non trouvé dans le panier' });
    }

    const product = await Product.findByPk(productId);
    product.stock += cartItem.quantity;
    await product.save();

    cart.totalPrice -= cartItem.price;
    await cartItem.destroy();
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Vider le panier
export const clearCart = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is missing' });
  }

  try {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    for (const cartItem of cartItems) {
      const product = await Product.findByPk(cartItem.productId);
      product.stock += cartItem.quantity;
      await product.save();
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Fonction pour vider le panier après un paiement réussi
export const clearCartAfterPayment = async (req, res) => {
  const userId = req.user.id;
  console.log('clearCartAfterPayment called, userId:', userId);

  if (!userId) {
    console.log('User ID is missing');
    return res.status(400).json({ message: 'User ID is missing' });
  }

  try {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      console.log('Panier non trouvé');
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    for (const cartItem of cartItems) {
      const product = await Product.findByPk(cartItem.productId);
      console.log(`Updating stock for product ${product.id}`);
      product.stock -= cartItem.quantity;
      await product.save();
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.totalPrice = 0;
    await cart.save();

    console.log('Panier vidé après paiement réussi');
    res.status(200).json({ message: 'Panier vidé après paiement réussi' });
  } catch (error) {
    console.error('Error clearing cart after payment:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
