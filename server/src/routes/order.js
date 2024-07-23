import express from 'express';
import { getOrders, downloadInvoice } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);
router.get('/', getOrders);
router.get('/:id/invoice', downloadInvoice);

export default router;
