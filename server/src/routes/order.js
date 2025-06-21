import express from 'express';
import { getOrders, downloadInvoice, getAllOrders, requestReturn, reorder, approveReturn, denyReturn, processManualRefund, downloadCreditNote } from '../controllers/orderController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);
router.get('/', getOrders);
router.get('/orders', authorize(['ROLE_ADMIN']), getAllOrders);
router.get('/:id/invoice', downloadInvoice);
router.post('/:id/return', requestReturn);
router.post('/:id/reorder', reorder);
router.put('/:id/return/approve', authorize(['ROLE_ADMIN']), approveReturn);
router.put('/:id/return/deny', authorize(['ROLE_ADMIN']), denyReturn);
router.post('/:id/refund', authorize(['ROLE_ADMIN']), processManualRefund);
router.get('/:id/credit-note', downloadCreditNote);

export default router;
