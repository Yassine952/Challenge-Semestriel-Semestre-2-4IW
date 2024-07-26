import Product from '../models/Product.js';
import ProductMongo from '../models/ProductMongo.js';
import { Op, Sequelize } from 'sequelize';
import CartItem from '../models/CartItem.js';
import Cart from '../models/Cart.js';
import mongoose from 'mongoose';

export const createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    const product = await Product.create(req.body);
    const productMongo = await ProductMongo.create({ ...req.body, productId: product.id });
    res.status(201).json({ product, productMongo });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await ProductMongo.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await ProductMongo.findOne({ productId });
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    await product.update(req.body);

    const mongoProduct = await ProductMongo.findOne({ productId });
    if (mongoProduct) {
      await mongoProduct.updateOne(req.body);
    }

    res.status(200).json({ product, mongoProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    const cartItems = await CartItem.findAll({ where: { productId: product.id } });

    for (const item of cartItems) {
      const cart = await Cart.findByPk(item.cartId);
      if (cart) {
        cart.totalPrice -= item.price;
        await cart.save();
        await item.destroy();
      }
    }

    await product.destroy();

    await ProductMongo.findOneAndDelete({ productId });

    res.status(200).json({ message: 'Produit supprimé' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q, name, description, category, priceMin, priceMax, inStock } = req.query;

    const query = { onSale: true };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (description) {
      query.description = { $regex: description, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (priceMin) {
      query.price = { ...query.price, $gte: parseFloat(priceMin) };
    }
    if (priceMax) {
      query.price = { ...query.price, $lte: parseFloat(priceMax) };
    }
    if (inStock !== undefined) {
      query.stock = inStock === 'true' ? { $gt: 0 } : { $lte: 0 };
    }

    const products = await ProductMongo.find(query);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await ProductMongo.distinct('category', { onSale: true });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProductsOnSale = async (req, res) => {
  try {
    const products = await ProductMongo.find({ onSale: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
