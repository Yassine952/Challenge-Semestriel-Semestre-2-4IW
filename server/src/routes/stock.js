import express from 'express';
import {
  getStockEvolutionChart,
  getProductStockEvolution,
  getStockMovementsStats,
  getStockMovementHistory,
  recordManualStockMovement,
  getLowStockWithHistory
} from '../controllers/stockController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();
router.get('/evolution/chart', 
  authenticateToken, 
  authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), 
  getStockEvolutionChart
);

router.get('/evolution/product/:productId', 
  authenticateToken, 
  authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), 
  getProductStockEvolution
);

router.get('/movements/stats', 
  authenticateToken, 
  authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), 
  getStockMovementsStats
);

router.get('/movements/history', 
  authenticateToken, 
  authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), 
  getStockMovementHistory
);
router.post('/movements', 
  authenticateToken, 
  authorize(['ROLE_ADMIN']), 
  recordManualStockMovement
);
router.get('/low-stock/history', 
  authenticateToken, 
  authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), 
  getLowStockWithHistory
);

export default router; 