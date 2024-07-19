import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Obtenir le panier de l'utilisateur
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Assurez-vous que l'utilisateur est authentifié
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

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.price = cartItem.quantity * product.price;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price * quantity
      });
    }

    cart.totalPrice += product.price * quantity;
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

    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
