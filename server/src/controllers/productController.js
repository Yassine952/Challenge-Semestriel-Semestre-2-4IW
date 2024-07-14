import Product from '../models/Product.js';
import { Op } from 'sequelize';

// Créez un nouveau produit
export const createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenez tous les produits
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenez un produit par son ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettez à jour un produit par son ID
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    await product.update(req.body);
    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimez un produit par son ID
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    await product.destroy();
    res.status(200).json({ message: 'Produit supprimé' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Recherche de produits avec filtres
export const searchProducts = async (req, res) => {
  try {
    const { name, description, category, priceMin, priceMax, inStock } = req.query;

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
    if (priceMin) {
      whereClause.price = { ...whereClause.price, [Op.gte]: parseFloat(priceMin) };
    }
    if (priceMax) {
      whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(priceMax) };
    }
    if (inStock !== undefined) {
      whereClause.stock = inStock === 'true' ? { [Op.gt]: 0 } : { [Op.lte]: 0 };
    }

    const products = await Product.findAll({ where: whereClause });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
