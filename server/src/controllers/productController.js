import Product from '../models/Product.js';
import { Op, Sequelize } from 'sequelize';
import CartItem from '../models/CartItem.js';
import Cart from '../models/Cart.js';


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

export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

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

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
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
    res.status(200).json({ message: 'Produit supprimé' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q, name, description, category, priceMin, priceMax, inStock } = req.query;

    const whereClause = { onSale: true };

    if (q) {
      whereClause[Op.or] = [
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), { [Op.like]: `%${q.toLowerCase()}%` }),
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('description')), { [Op.like]: `%${q.toLowerCase()}%` })
      ];
    }
    if (name) {
      whereClause.name = Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), { [Op.like]: `%${name.toLowerCase()}%` });
    }
    if (description) {
      whereClause.description = Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('description')), { [Op.like]: `%${description.toLowerCase()}%` });
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

    console.log('Search whereClause:', whereClause);

    const products = await Product.findAll({ where: whereClause });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']],
      where: { onSale: true }
    });
    const categoryList = categories.map(category => category.category);
    res.status(200).json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProductsOnSale = async (req, res) => {
  try {
    const products = await Product.findAll({ where: { onSale: true } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
