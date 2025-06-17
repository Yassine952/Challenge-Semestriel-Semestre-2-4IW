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
router.use(authenticateToken);
router.get('/alerts', getUserAlertPreferences);
router.put('/alerts', updateUserAlertPreferences);
router.get('/categories', getAvailableCategories);
router.get('/alerts/history', getUserAlertHistory);
router.get('/alerts/unread-count', getUnreadAlertsCount);
router.put('/alerts/:alertId/read', markAlertAsRead);
router.put('/alerts/mark-all-read', markAllAlertsAsRead);

export default router; 