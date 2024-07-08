// server/src/routes/product.js
import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, searchProducts } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

router.get('/search', searchProducts);
export default router;
