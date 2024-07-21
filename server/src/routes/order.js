// server/src/routes/order.js
import express from 'express';
import { getOrders, downloadInvoice } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getOrders);
router.get('/:id/invoice', authenticate, downloadInvoice);

export default router;
