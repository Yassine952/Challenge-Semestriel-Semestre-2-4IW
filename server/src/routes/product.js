import express from 'express';
import {
  searchProducts,
  createProduct,
  getProducts,
  getCategories,
  getBrands,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js'; 
import { authenticateToken, authorize } from '../middleware/auth.js';
const router = express.Router();

router.get('/search', searchProducts); 
router.post('/',authenticateToken,authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), createProduct);
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/:id', getProductById);
router.put('/:id',authenticateToken,authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), updateProduct);
router.delete('/:id',authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']),deleteProduct);

export default router;
