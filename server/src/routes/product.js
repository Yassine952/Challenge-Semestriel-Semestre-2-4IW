import express from 'express';
import {
  searchProducts,
  createProduct,
  getProducts,
  getCategories,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js'; // Assurez-vous que le chemin est correct
import { authenticateToken, authorize } from '../middleware/auth.js';
const router = express.Router();
router.use(authenticateToken);
router.get('/search', searchProducts); // Ajout de la route de recherche

// Create a new product
router.post('/',authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), createProduct);

// Get all products
router.get('/', getProducts);

router.get('/categories', getCategories);
// Get a product by ID
router.get('/:id', getProductById);

// Update a product by ID
router.put('/:id',authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), updateProduct);

// Delete a product by ID
router.delete('/:id', authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), deleteProduct);

export default router;
