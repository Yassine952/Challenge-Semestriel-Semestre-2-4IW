import express from 'express';
import { checkLowStock, sendNewsletter, previewNewsletter, updateStockThreshold, getStockThreshold, testLowStockAlert } from '../controllers/alertController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Vérifier les stocks faibles (admin/store keeper seulement)
router.get('/check-low-stock', authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), checkLowStock);

// Prévisualiser une newsletter (admin et store keeper)
router.post('/preview-newsletter', authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), previewNewsletter);

// Envoyer une newsletter (admin et store keeper)
router.post('/send-newsletter', authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), sendNewsletter);

// ✅ NOUVELLES ROUTES - Configuration du seuil de stock faible
// Récupérer le seuil actuel (admin/store keeper seulement)
router.get('/stock-threshold', authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), getStockThreshold);

// Mettre à jour le seuil (admin/store keeper seulement)
router.put('/stock-threshold', authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), updateStockThreshold);

// ✅ ROUTE DE TEST - Tester l'alerte pour un produit spécifique (admin/store keeper seulement)
router.post('/test-low-stock/:productId', authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), testLowStockAlert);

export default router; 