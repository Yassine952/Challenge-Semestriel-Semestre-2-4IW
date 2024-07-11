import Product from '../models/Product.js';
import { Op } from 'sequelize';

export const createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body); // Ajout de log
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error); // Ajout de log
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error); // Ajout de log
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error); // Ajout de log
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    await product.update(req.body);
    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error); // Ajout de log
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    await product.destroy();
    res.status(200).json({ message: 'Produit supprimé' });
  } catch (error) {
    console.error('Error deleting product:', error); // Ajout de log
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Recherche de produits avec filtres
export const searchProducts = async (req, res) => {
  try {
    const { name, description, category, brand, priceMin, priceMax, onSale, inStock } = req.query;

    const whereClause = {};

    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (description) {
      whereClause.description = { [Op.like]: `%${description}%` };
    }
    if (category) {
      whereClause.category = category;
    }
    if (brand) {
      whereClause.brand = brand;
    }
    if (priceMin) {
      whereClause.price = { ...whereClause.price, [Op.gte]: parseFloat(priceMin) };
    }
    if (priceMax) {
      whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(priceMax) };
    }
    if (onSale) {
      whereClause.onSale = onSale === 'true';
    }
    if (inStock) {
      whereClause.stock = { [Op.gt]: 0 };
    }

    const products = await Product.findAll({ where: whereClause });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
