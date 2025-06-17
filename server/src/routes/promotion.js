import express from 'express';
import {
  createPromotion,
  getPromotions,
  getPromotionById,
  validatePromoCode,
  applyPromoCode,
  updatePromotion,
  deletePromotion,
  getActivePromotionsForProduct
} from '../controllers/promotionController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/validate', validatePromoCode);
router.get('/active', getActivePromotionsForProduct);

router.post('/', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), createPromotion);
router.get('/', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), getPromotions);
router.get('/:id', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), getPromotionById);
router.put('/:id', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), updatePromotion);
router.delete('/:id', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), deletePromotion);

router.post('/apply', authenticateToken, applyPromoCode);

export default router; 