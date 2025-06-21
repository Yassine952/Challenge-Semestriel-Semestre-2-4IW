import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import ProductMongo from '../models/ProductMongo.js';
import StockSyncService from '../services/stockSyncService.js';
import { updateProductStockRelative } from '../services/hybridStockService.js';
import { Op } from 'sequelize';
import cron from 'node-cron';

const RESERVATION_TIME = 1 * 60 * 1000;

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
    try {
      // 🔧 CORRECTION: Utiliser la fonction relative pour libérer le stock expiré
      await updateProductStockRelative(
        item.productId,
        item.quantity, // Quantité positive pour remettre en stock
        1, // Admin user fallback
        'release',
        'Libération stock panier expiré',
        `expired-cart-${item.cartId}-${Date.now()}`
      );
      console.log(`✅ Stock libéré via architecture hybride - Produit ${item.productId}: ${item.quantity} unités`);
    } catch (hybridError) {
      console.error('❌ Erreur architecture hybride lors de la libération:', hybridError);
      // Fallback : libération classique
      const product = await Product.findByPk(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    await item.destroy();
  }

  const cartIds = [...new Set(expiredItems.map(item => item.cartId))];
  for (const cartId of cartIds) {
    const totalPrice = await CartItem.sum('price', { where: { cartId } });
    await Cart.update({ totalPrice: totalPrice || 0 }, { where: { id: cartId } });
  }
};

cron.schedule('* * * * *', cleanExpiredItems);

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

    // 🔧 CORRECTION: Utiliser MongoDB pour récupérer le produit (selon cahier des charges)
    const product = await ProductMongo.findOne({ productId });
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

    // 🔧 CORRECTION: Utiliser la fonction relative pour réserver le stock
    try {
      await updateProductStockRelative(
        productId,
        -quantity, // Quantité négative pour réserver le stock
        userId,
        'reservation',
        `Réservation panier - ${quantity} unités`,
        `cart-${cart.id}-${Date.now()}`
      );
      console.log(`✅ Stock réservé via architecture hybride - Produit ${productId}: ${quantity} unités`);
    } catch (hybridError) {
      console.error('❌ Erreur architecture hybride lors de l\'ajout au panier:', hybridError);
      // Fallback : utiliser l'ancien service
      await StockSyncService.reserveStock(productId, quantity, userId, cart.id);
    }

    cart.totalPrice = await CartItem.sum('price', { where: { cartId: cart.id } });
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID manquant' });
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

    // 🔧 CORRECTION: Utiliser la fonction relative pour libérer le stock
    try {
      await updateProductStockRelative(
        productId,
        cartItem.quantity, // Quantité positive pour libérer le stock
        userId,
        'release',
        `Libération stock panier - ${cartItem.quantity} unités`,
        `cart-release-${cart.id}-${Date.now()}`
      );
      console.log(`✅ Stock libéré via architecture hybride - Produit ${productId}: ${cartItem.quantity} unités`);
    } catch (hybridError) {
      console.error('❌ Erreur architecture hybride lors de la suppression du panier:', hybridError);
      // Fallback : utiliser l'ancien service
      await StockSyncService.releaseStock(productId, cartItem.quantity, userId, cart.id);
    }

    cart.totalPrice -= cartItem.price;
    await cartItem.destroy();
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const clearCart = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'ID utilisateur est manquant' });
  }

  try {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    for (const cartItem of cartItems) {
      // Utiliser le service de synchronisation pour libérer le stock
      await StockSyncService.releaseStock(cartItem.productId, cartItem.quantity, userId, cart.id);
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const checkExpiredCartItems = async (cartId) => {
  const now = new Date();
  const expiredItems = await CartItem.findAll({
    where: {
      cartId,
      reservationExpiry: {
        [Op.lt]: now,
      },
    },
  });

  return expiredItems.length > 0;
};


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
      await cartItem.destroy();
    }

    cart.totalPrice = 0;
    await cart.save();

    console.log('Panier vidé après paiement réussi');
    res.status(200).json({ message: 'Panier vidé après paiement réussi' });
  } catch (error) {
    console.error('Error clearing cart after payment:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
