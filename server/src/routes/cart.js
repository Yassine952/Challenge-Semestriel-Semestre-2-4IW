import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { addToCart, getCart, removeFromCart, clearCart, clearCartAfterPayment } from '../controllers/cartController.js';

const router = express.Router();

// Apply the middleware to all routes in this router
router.use(authenticateToken);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/remove', removeFromCart);
router.post('/clear', clearCart);
router.post('/clear-after-payment', clearCartAfterPayment);

export default router;
