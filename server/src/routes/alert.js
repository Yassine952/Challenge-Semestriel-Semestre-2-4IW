import express from 'express';
import { checkLowStock, sendNewsletter } from '../controllers/alertController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);
router.get('/check-low-stock', authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), checkLowStock);
router.post('/send-newsletter', authorize(['ROLE_ADMIN']), sendNewsletter);

export default router; 