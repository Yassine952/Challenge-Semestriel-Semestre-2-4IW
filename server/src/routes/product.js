import express from 'express';
import {
  searchProducts,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js'; // Assurez-vous que le chemin est correct

const router = express.Router();

router.get('/search', searchProducts); // Ajout de la route de recherche

// Create a new product
router.post('/', createProduct);

// Get all products
router.get('/', getProducts);

// Get a product by ID
router.get('/:id', getProductById);

// Update a product by ID
router.put('/:id', updateProduct);

// Delete a product by ID
router.delete('/:id', deleteProduct);

export default router;
