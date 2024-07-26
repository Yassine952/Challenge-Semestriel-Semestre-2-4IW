import express from 'express';
import { getOrders, downloadInvoice, getAllOrders } from '../controllers/orderController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);
router.get('/', getOrders);
router.get('/orders', authorize(['ROLE_ADMIN']), getAllOrders);
router.get('/:id/invoice', downloadInvoice);

export default router;
