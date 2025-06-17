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

router.get('/stats', authenticateToken, authorize(['ROLE_ADMIN']), getStats);
router.get('/orders-over-time', authenticateToken, authorize(['ROLE_ADMIN']), getOrdersOverTime);
router.get('/revenue-over-time', authenticateToken, authorize(['ROLE_ADMIN']), getRevenueOverTime);
router.get('/order-status-distribution', authenticateToken, authorize(['ROLE_ADMIN']), getOrderStatusDistribution);
router.get('/top-products', authenticateToken, authorize(['ROLE_ADMIN']), getTopProducts);
router.get('/revenue-by-category', authenticateToken, authorize(['ROLE_ADMIN']), getRevenueByCategory);
router.get('/users-over-time', authenticateToken, authorize(['ROLE_ADMIN']), getUsersOverTime);

export default router; 