import express from 'express';
import {
  createPromotion,
  getPromotions,
  getPromotionById,
  validatePromoCode,
  applyPromoCode,
  updatePromotion,
  deletePromotion,
  getActivePromotionsForProduct,
  getActivePromotions
} from '../controllers/promotionController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.post('/validate', validatePromoCode); // Valider un code promo
router.get('/active', getActivePromotionsForProduct); // Promotions actives pour un produit
router.get('/active-all', getActivePromotions); // Toutes les promotions actives (pour les utilisateurs)

// Routes protégées - Admin/Store Keeper
router.post('/', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), createPromotion);
router.get('/', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), getPromotions);
router.get('/:id', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), getPromotionById);
router.put('/:id', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), updatePromotion);
router.delete('/:id', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), deletePromotion);

// Route pour appliquer un code promo (utilisée lors du paiement)
router.post('/apply', authenticateToken, applyPromoCode);

export default router; 