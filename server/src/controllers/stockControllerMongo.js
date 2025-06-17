import {
  getGlobalStockEvolutionMongo,
  getProductStockEvolutionMongo,
  getStockMovementsByTypeMongo,
  getTopStockMovementsMongo,
  getStockAnalyticsMongo,
  getLowStockWithContextMongo
} from '../services/stockServiceMongo.js';

export const getStockEvolutionChartMongo = async (req, res) => {
  try {
    const { period = '3m' } = req.query;
    
    console.time('MongoDB Stock Evolution Query');
    const evolution = await getGlobalStockEvolutionMongo(period);
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

export const getProductStockEvolutionMongo = async (req, res) => {
  try {
    const { productId } = req.params;
    const { period = '3m' } = req.query;
    
    console.time(`MongoDB Product ${productId} Evolution Query`);
    const evolution = await getProductStockEvolutionMongo(productId, period);
    console.timeEnd(`MongoDB Product ${productId} Evolution Query`);
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

export const getAdvancedStockStatsMongo = async (req, res) => {
  try {
    const { period = '1m' } = req.query;
    
    console.time('MongoDB Advanced Stats Query');
    const [movementsByType, topMovements, analytics] = await Promise.all([
      getStockMovementsByTypeMongo(period),
      getTopStockMovementsMongo(period, 10),
      getStockAnalyticsMongo(period)
    ]);
    console.timeEnd('MongoDB Advanced Stats Query');
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
    const topProductsChart = {
      labels: topMovements.map(item => item.productName?.substring(0, 20) || `Produit ${item.productId}`),
      datasets: [{
        label: 'Mouvements totaux',
        data: topMovements.map(item => item.totalQuantity),
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      }]
    };
    const activityHeatmap = {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: Array.from({length: 24}, (_, hour) => ({
        label: `${hour}h`,
        data: analytics
          .filter(item => item.hour === hour)
          .sort((a, b) => a.weekday - b.weekday)
          .map(item => item.totalMovements)
      }))
    };

    res.json({
      movementsByType,
      topMovements,
      analytics,
      charts: {
        movementTypeChart,
        topProductsChart,
        activityHeatmap
      },
      performance: {
        database: 'MongoDB',
        optimized: true,
        queryTime: 'Voir console pour les temps'
      }
    });
  } catch (error) {
    console.error('Error getting advanced stock stats (MongoDB):', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques avancées' });
  }
};

export const getLowStockWithContextMongo = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    console.time('MongoDB Low Stock Context Query');
    const lowStockProducts = await getLowStockWithContextMongo(threshold);
    console.timeEnd('MongoDB Low Stock Context Query');
    const enrichedProducts = lowStockProducts.map(product => {
      const daysSinceLastSale = product.lastSale 
        ? Math.floor((Date.now() - new Date(product.lastSale).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      const daysSinceLastRestock = product.lastRestock
        ? Math.floor((Date.now() - new Date(product.lastRestock).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...product,
        insights: {
          daysSinceLastSale,
          daysSinceLastRestock,
          needsUrgentRestock: product.currentStock <= 3 && daysSinceLastSale <= 7,
          slowMoving: daysSinceLastSale > 30,
          recommendation: getStockRecommendation(product, daysSinceLastSale, daysSinceLastRestock)
        }
      };
    });

    res.json({
      lowStockProducts: enrichedProducts,
      threshold,
      totalCount: lowStockProducts.length,
      criticalCount: lowStockProducts.filter(p => p.urgency === 'critical').length,
      warningCount: lowStockProducts.filter(p => p.urgency === 'warning').length,
      database: 'MongoDB (Optimisé)',
      features: [
        'Contexte historique enrichi',
        'Analyse de tendances',
        'Recommandations automatiques',
        'Détection produits à rotation lente'
      ]
    });
  } catch (error) {
    console.error('Error getting low stock with context (MongoDB):', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stocks faibles avec contexte' });
  }
};

export const getPerformanceComparison = async (req, res) => {
  try {
    const { period = '1m' } = req.query;
    console.time('MongoDB Total Query Time');
    const mongoStart = Date.now();
    await getGlobalStockEvolutionMongo(period);
    const mongoTime = Date.now() - mongoStart;
    console.timeEnd('MongoDB Total Query Time');
    console.time('PostgreSQL Total Query Time');
    const pgStart = Date.now();
    const { getGlobalStockEvolution } = await import('../services/stockService.js');
    await getGlobalStockEvolution(period);
    const pgTime = Date.now() - pgStart;
    console.timeEnd('PostgreSQL Total Query Time');
    
    const performance = {
      mongodb: {
        queryTime: mongoTime,
        database: 'MongoDB',
        advantages: [
          'Agrégations pipelines natives',
          'Index optimisés pour les dates',
          'Pas de JOIN complexes',
          'Métadonnées enrichies'
        ]
      },
      postgresql: {
        queryTime: pgTime,
        database: 'PostgreSQL',
        advantages: [
          'Transactions ACID',
          'Relations strictes',
          'Intégrité référentielle',
          'SQL standard'
        ]
      },
      winner: mongoTime < pgTime ? 'MongoDB' : 'PostgreSQL',
      improvement: Math.abs(((mongoTime - pgTime) / pgTime) * 100).toFixed(1) + '%',
      recommendation: mongoTime < pgTime 
        ? 'Utiliser MongoDB pour les graphiques'
        : 'PostgreSQL reste optimal'
    };
    
    res.json(performance);
  } catch (error) {
    console.error('Error in performance comparison:', error);
    res.status(500).json({ error: 'Erreur lors de la comparaison de performance' });
  }
};

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

const getStockRecommendation = (product, daysSinceLastSale, daysSinceLastRestock) => {
  if (product.currentStock <= 3 && daysSinceLastSale <= 7) {
    return 'URGENT: Réapprovisionner immédiatement (produit à forte rotation)';
  }
  if (daysSinceLastSale > 30) {
    return 'ATTENTION: Produit à rotation lente, évaluer la demande';
  }
  if (daysSinceLastRestock > 60) {
    return 'INFO: Pas de réapprovisionnement récent, vérifier les prévisions';
  }
  return 'Réapprovisionnement standard recommandé';
}; 