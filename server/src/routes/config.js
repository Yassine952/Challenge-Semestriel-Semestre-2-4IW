import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.js';
import ConfigService from '../services/configService.js';

const router = express.Router();

// Récupérer toutes les configurations (admin seulement)
router.get('/', authenticateToken, authorize(['ROLE_ADMIN']), async (req, res) => {
  try {
    const configs = await ConfigService.getAll();
    res.json(configs);
  } catch (error) {
    console.error('Erreur récupération configurations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des configurations' });
  }
});

// Récupérer une configuration spécifique
router.get('/:key', authenticateToken, authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), async (req, res) => {
  try {
    const { key } = req.params;
    const value = await ConfigService.get(key);
    
    if (value === null) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    res.json({ key, value });
  } catch (error) {
    console.error('Erreur récupération configuration:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la configuration' });
  }
});

// Mettre à jour une configuration
router.put('/:key', authenticateToken, authorize(['ROLE_ADMIN']), async (req, res) => {
  try {
    const { key } = req.params;
    const { value, dataType = 'string', description } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Valeur requise' });
    }
    
    const success = await ConfigService.set(key, value, dataType, description);
    
    if (!success) {
      return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
    
    res.json({ 
      message: `Configuration ${key} mise à jour`,
      key,
      value,
      dataType
    });
  } catch (error) {
    console.error('Erreur mise à jour configuration:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la configuration' });
  }
});

// Supprimer une configuration
router.delete('/:key', authenticateToken, authorize(['ROLE_ADMIN']), async (req, res) => {
  try {
    const { key } = req.params;
    
    // Empêcher la suppression de configurations critiques
    const protectedKeys = ['low_stock_threshold', 'email_notifications_enabled'];
    if (protectedKeys.includes(key)) {
      return res.status(403).json({ error: 'Cette configuration ne peut pas être supprimée' });
    }
    
    const success = await ConfigService.delete(key);
    
    if (!success) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    res.json({ message: `Configuration ${key} supprimée` });
  } catch (error) {
    console.error('Erreur suppression configuration:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la configuration' });
  }
});

// Vider le cache de configuration
router.post('/clear-cache', authenticateToken, authorize(['ROLE_ADMIN']), async (req, res) => {
  try {
    ConfigService.clearCache();
    res.json({ message: 'Cache de configuration vidé' });
  } catch (error) {
    console.error('Erreur vidage cache:', error);
    res.status(500).json({ error: 'Erreur lors du vidage du cache' });
  }
});

export default router; 