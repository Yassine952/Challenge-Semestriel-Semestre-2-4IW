import express from 'express';
import { 
  getStats, 
  getOrdersOverTime, 
  getRevenueOverTime, 
  getOrderStatusDistribution, 
  getTopProducts, 
  getRevenueByCategory, 
  getUsersOverTime 
} from '../controllers/dashboardController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_COMPTA']), getStats);
router.get('/orders-over-time', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_COMPTA']), getOrdersOverTime);
router.get('/revenue-over-time', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_COMPTA']), getRevenueOverTime);
router.get('/order-status-distribution', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_COMPTA']), getOrderStatusDistribution);
router.get('/top-products', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_COMPTA']), getTopProducts);
router.get('/revenue-by-category', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_COMPTA']), getRevenueByCategory);
router.get('/users-over-time', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_COMPTA']), getUsersOverTime);

export default router; 