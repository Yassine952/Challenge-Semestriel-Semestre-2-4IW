// server/src/routes/order.js
import express from 'express';
import { getOrders, downloadInvoice } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);
router.get('/', getOrders);
router.get('/:id/invoice', downloadInvoice); // Corriger ici si nécessaire

export default router;
