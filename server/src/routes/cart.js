import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { addToCart, getCart, removeFromCart, clearCart, clearCartAfterPayment } from '../controllers/cartController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/clear-after-payment', clearCartAfterPayment);

export default router;
