import express from 'express';
import { 
  getUserAlertPreferences, 
  updateUserAlertPreferences, 
  getAvailableCategories,
  getUserAlertHistory,
  markAlertAsRead,
  markAllAlertsAsRead,
  getUnreadAlertsCount
} from '../controllers/userPreferencesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Récupérer les préférences d'alertes de l'utilisateur connecté
router.get('/alerts', getUserAlertPreferences);

// Mettre à jour les préférences d'alertes de l'utilisateur connecté
router.put('/alerts', updateUserAlertPreferences);

// Récupérer toutes les catégories disponibles
router.get('/categories', getAvailableCategories);

// Récupérer l'historique des alertes de l'utilisateur
router.get('/alerts/history', getUserAlertHistory);

// Récupérer le nombre d'alertes non lues
router.get('/alerts/unread-count', getUnreadAlertsCount);

// Marquer une alerte comme lue
router.put('/alerts/:alertId/read', markAlertAsRead);

// Marquer toutes les alertes comme lues
router.put('/alerts/mark-all-read', markAllAlertsAsRead);

export default router; 