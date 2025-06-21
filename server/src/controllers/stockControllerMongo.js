import {
  getGlobalStockEvolution,
  getProductStockEvolution,
  getStockMovementsByType
} from '../services/hybridStockService.js';

/**
 * 🔥 CONTRÔLEUR MONGODB HYBRIDE
 * Utilise l'écriture double automatique et lecture MongoDB
 */

/**
 * Graphique d'évolution globale (MongoDB)
 */
export const getStockEvolutionChartMongo = async (req, res) => {
  try {
    const { period = '3m' } = req.query;
    
    console.time('MongoDB Stock Evolution Query');
    const evolution = await getGlobalStockEvolution(period);
    console.timeEnd('MongoDB Stock Evolution Query');
    
    if (!evolution || evolution.length === 0) {
      return res.json({
        labels: [],
        datasets: [{
          label: 'Stock Total',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true
        }]
      });
    }
    
    // Formater pour Chart.js
    const chartData = {
      labels: evolution.map(item => new Date(item.date).toLocaleDateString('fr-FR')),
      datasets: [{
        label: 'Stock Total',
        data: evolution.map(item => item.totalStock),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true
      }, {
        label: 'Mouvements par jour',
        data: evolution.map(item => item.movements),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y1',
        tension: 0.1
      }]
    };

    res.json(chartData);
  } catch (error) {
    console.error('Error getting stock evolution chart (MongoDB):', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évolution des stocks' });
  }
};

/**
 * Évolution d'un produit spécifique (MongoDB)
 */
export const getProductStockEvolutionMongo = async (req, res) => {
  try {
    const { productId } = req.params;
    const { period = '3m' } = req.query;
    
    console.time(`MongoDB Product ${productId} Evolution Query`);
    const evolution = await getProductStockEvolution(productId, period);
    console.timeEnd(`MongoDB Product ${productId} Evolution Query`);
    
    // Formater pour Chart.js
    const chartData = {
      labels: evolution.map(item => new Date(item.date).toLocaleDateString('fr-FR')),
      datasets: [{
        label: `Stock - ${evolution[0]?.productName || 'Produit'}`,
        data: evolution.map(item => item.stock),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
        fill: true
      }]
    };

    res.json({
      chartData,
      movements: evolution,
      productName: evolution[0]?.productName
    });
  } catch (error) {
    console.error('Error getting product stock evolution (MongoDB):', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évolution du stock produit' });
  }
};

/**
 * Statistiques avancées avec MongoDB
 */
export const getAdvancedStockStatsMongo = async (req, res) => {
  try {
    const { period = '1m' } = req.query;
    
    console.time('MongoDB Advanced Stats Query');
    const movementsByType = await getStockMovementsByType(period);
    console.timeEnd('MongoDB Advanced Stats Query');

    // Graphique en secteurs pour les types de mouvements
    const movementTypeChart = {
      labels: movementsByType.map(item => getMovementTypeLabel(item.type)),
      datasets: [{
        label: 'Quantité',
        data: movementsByType.map(item => item.totalQuantity),
        backgroundColor: [
          '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4',
          '#84cc16', '#f97316', '#dc2626', '#6366f1', '#64748b'
        ]
      }]
    };

    res.json({
      movementsByType,
      topMovements: [], // À implémenter si nécessaire
      charts: {
        movementTypeChart
      },
      performance: {
        database: 'MongoDB (Écriture Double)',
        optimized: true,
        architecture: 'PostgreSQL + MongoDB'
      }
    });
  } catch (error) {
    console.error('Error getting advanced stock stats (MongoDB):', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques avancées' });
  }
};

/**
 * Alertes de stock avec contexte enrichi
 */
export const getLowStockWithContextMongo = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    // Pour l'instant, utilisation simple
    // Peut être enrichi avec les données MongoDB
    res.json({
      lowStockProducts: [],
      threshold,
      totalCount: 0,
      criticalCount: 0,
      warningCount: 0,
      database: 'MongoDB (Écriture Double)',
      message: 'Fonctionnalité en cours d\'implémentation'
    });
  } catch (error) {
    console.error('Error getting low stock with context (MongoDB):', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stocks faibles avec contexte' });
  }
};

/**
 * Comparaison de performance
 */
export const getPerformanceComparison = async (req, res) => {
  try {
    const { period = '1m' } = req.query;
    
    // Test MongoDB
    console.time('MongoDB Total Query Time');
    const mongoStart = Date.now();
    await getGlobalStockEvolution(period);
    const mongoTime = Date.now() - mongoStart;
    console.timeEnd('MongoDB Total Query Time');
    
    const performance = {
      mongodb: {
        queryTime: mongoTime,
        database: 'MongoDB',
        architecture: 'Écriture Double',
        advantages: [
          'Agrégations pipelines natives',
          'Index optimisés pour les dates',
          'Pas de JOIN complexes',
          'Métadonnées enrichies'
        ]
      },
      postgresql: {
        queryTime: 'N/A',
        database: 'PostgreSQL',
        role: 'Source de vérité',
        advantages: [
          'Transactions ACID',
          'Relations strictes',
          'Intégrité référentielle',
          'SQL standard'
        ]
      },
      recommendation: 'Architecture Hybride Optimale'
    };
    
    res.json(performance);
  } catch (error) {
    console.error('Error in performance comparison:', error);
    res.status(500).json({ error: 'Erreur lors de la comparaison de performance' });
  }
};

/**
 * Utilitaires
 */
const getMovementTypeLabel = (type) => {
  const labels = {
    'purchase': 'Achat/Réapprovisionnement',
    'sale': 'Vente',
    'adjustment': 'Ajustement',
    'return': 'Retour',
    'reservation': 'Réservation',
    'release': 'Libération',
    'damage': 'Dommage',
    'theft': 'Vol/Perte',
    'transfer': 'Transfert',
    'initial': 'Stock Initial'
  };
  return labels[type] || type;
}; 