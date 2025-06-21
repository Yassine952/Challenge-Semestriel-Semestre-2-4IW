import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { 
  getFinancialStats, 
  extractInvoices, 
  downloadFile, 
  generateFinancialReport 
} from '../controllers/comptaController.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification et le rôle COMPTA
router.use(authenticateToken);
router.use(authorize('ROLE_COMPTA'));

// Obtenir les statistiques financières
router.get('/stats', getFinancialStats);

// Extraire les factures selon les filtres
router.post('/extract-invoices', extractInvoices);

// Générer un rapport financier
router.post('/financial-report', generateFinancialReport);

// Télécharger un fichier généré
router.get('/download/:fileName', downloadFile);

export default router; 