import {
  recordStockMovement,
  getStockEvolution,
  getGlobalStockEvolution,
  getStockMovementsByType,
  getTopStockMovements
} from '../services/stockService.js';
import { updateProductStockRelative } from '../services/hybridStockService.js';
import StockHistory from '../models/StockHistory.js';
import StockHistoryMongo from '../models/StockHistoryMongo.js';
import Product from '../models/Product.js';
import ProductMongo from '../models/ProductMongo.js';
import { Op } from 'sequelize';

/**
 * Obtient l'évolution des stocks globale
 */
export const getStockEvolutionChart = async (req, res) => {
  try {
    const { period = '3m' } = req.query;
    
    const evolution = await getGlobalStockEvolution(period);
    
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
      }]
    };

    res.json(chartData);
  } catch (error) {
    console.error('Error getting stock evolution chart:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évolution des stocks' });
  }
};

/**
 * Obtient l'évolution des stocks pour un produit spécifique
 */
export const getProductStockEvolution = async (req, res) => {
  try {
    const { productId } = req.params;
    const { period = '3m' } = req.query;
    
    const evolution = await getStockEvolution(productId, period);
    
    // Formater pour Chart.js
    const chartData = {
      labels: evolution.map(item => new Date(item.date).toLocaleDateString('fr-FR')),
      datasets: [{
        label: 'Stock du Produit',
        data: evolution.map(item => item.stock),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
        fill: true
      }]
    };

    res.json({
      chartData,
      movements: evolution
    });
  } catch (error) {
    console.error('Error getting product stock evolution:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évolution du stock produit' });
  }
};

/**
 * Obtient les statistiques des mouvements de stock
 */
export const getStockMovementsStats = async (req, res) => {
  try {
    const { period = '1m' } = req.query;
    
    const [movementsByType, topMovements] = await Promise.all([
      getStockMovementsByType(period),
      getTopStockMovements(period, 10)
    ]);

    // Formater les données pour les graphiques
    const movementTypeChart = {
      labels: movementsByType.map(item => getMovementTypeLabel(item.type)),
      datasets: [{
        label: 'Quantité',
        data: movementsByType.map(item => item.totalQuantity),
        backgroundColor: [
          '#ef4444', // sale - rouge
          '#22c55e', // purchase - vert
          '#f59e0b', // adjustment - orange
          '#8b5cf6', // return - violet
          '#06b6d4', // reservation - cyan
          '#84cc16', // release - lime
          '#f97316', // damage - orange foncé
          '#dc2626', // theft - rouge foncé
          '#6366f1', // transfer - indigo
          '#64748b'  // initial - gris
        ]
      }]
    };

    res.json({
      movementsByType,
      topMovements,
      movementTypeChart
    });
  } catch (error) {
    console.error('Error getting stock movements stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques de stock' });
  }
};

/**
 * Obtient l'historique détaillé des mouvements de stock
 */
export const getStockMovementHistory = async (req, res) => {
  try {
    const { 
      productId, 
      movementType, 
      period = '1m', 
      page = 1, 
      limit = 50 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filtres
    if (productId) {
      whereClause.productId = productId;
    }
    if (movementType) {
      whereClause.movementType = movementType;
    }

    // Filtre de période
    const now = new Date();
    let startDate;
    switch (period) {
      case '1w':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    whereClause.createdAt = { [Op.gte]: startDate };

    const { count, rows } = await StockHistory.findAndCountAll({
      where: whereClause,
      include: [{
        model: Product,
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const movements = rows.map(movement => ({
      id: movement.id,
      productName: movement.Product.name,
      movementType: movement.movementType,
      movementTypeLabel: getMovementTypeLabel(movement.movementType),
      quantityBefore: movement.quantityBefore,
      quantityChange: movement.quantityChange,
      quantityAfter: movement.quantityAfter,
      reason: movement.reason,
      reference: movement.reference,
      cost: movement.cost,
      totalValue: movement.totalValue,
      createdAt: movement.createdAt
    }));

    res.json({
      movements,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      hasMore: offset + movements.length < count
    });
  } catch (error) {
    console.error('Error getting stock movement history:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique des mouvements' });
  }
};

/**
 * Enregistre manuellement un mouvement de stock
 */
export const recordManualStockMovement = async (req, res) => {
  try {
    const {
      productId,
      movementType,
      quantityChange,
      reason,
      cost,
      notes
    } = req.body;

    const userId = req.user.id;

    // Validation
    if (!productId || !movementType || quantityChange === undefined) {
      return res.status(400).json({ 
        error: 'ProductId, movementType et quantityChange sont requis' 
      });
    }

    // 🔧 CORRECTION: Utiliser MongoDB pour vérifier que le produit existe (selon cahier des charges)
    const product = await ProductMongo.findOne({ productId });
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Vérifier que le stock ne devient pas négatif
    if (product.stock + quantityChange < 0) {
      return res.status(400).json({ 
        error: 'Le stock ne peut pas être négatif' 
      });
    }

    // 🔧 CORRECTION: Utiliser l'architecture hybride relative pour le mouvement de stock
    try {
      const result = await updateProductStockRelative(
        productId,
        quantityChange,
        userId,
        movementType,
        reason || `Mouvement manuel ${movementType}`,
        notes || `manual-${Date.now()}`,
        cost
      );

      console.log(`✅ Mouvement de stock enregistré via architecture hybride - Produit ${productId}: ${quantityChange} unités`);

      res.status(201).json({
        message: 'Mouvement de stock enregistré avec succès',
        movement: {
          id: result.movement?.id,
          productId: result.movement?.productId,
          movementType: result.movement?.movementType,
          quantityChange: result.movement?.quantityChange,
          quantityAfter: result.newStock,
          createdAt: result.movement?.createdAt
        }
      });
    } catch (hybridError) {
      console.error('❌ Erreur architecture hybride:', hybridError);
      
      // Fallback : enregistrement classique
      const movement = await recordStockMovement({
        productId,
        userId,
        movementType,
        quantityChange,
        reason,
        cost,
        notes
      });

      // Mettre à jour le stock du produit
      const pgProduct = await Product.findByPk(productId);
      await pgProduct.update({
        stock: pgProduct.stock + quantityChange
      });

      // Synchroniser avec MongoDB si nécessaire
      try {
        await ProductMongo.updateOne(
          { productId },
          { stock: pgProduct.stock + quantityChange }
        );
      } catch (mongoError) {
        console.error('Error syncing with MongoDB:', mongoError);
      }

      res.status(201).json({
        message: 'Mouvement de stock enregistré avec succès (mode fallback)',
        movement: {
          id: movement.id,
          productId: movement.productId,
          movementType: movement.movementType,
          quantityChange: movement.quantityChange,
          quantityAfter: movement.quantityAfter,
          createdAt: movement.createdAt
        }
      });
    }
  } catch (error) {
    console.error('Error recording manual stock movement:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du mouvement de stock' });
  }
};

/**
 * Obtient les alertes de stock faible avec historique
 */
export const getLowStockWithHistory = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    // 🔧 CORRECTION: Utiliser MongoDB pour les produits en stock faible (selon cahier des charges)
    const lowStockProducts = await ProductMongo.find({
      stock: { $lte: threshold }
    });

    // Pour chaque produit, obtenir l'historique récent depuis MongoDB
    const productsWithHistory = await Promise.all(
      lowStockProducts.map(async (product) => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        // 🔧 CORRECTION: Utiliser MongoDB pour l'historique (selon cahier des charges)
        const recentMovements = await StockHistoryMongo.find({
          productId: product.productId,
          createdAt: { $gte: thirtyDaysAgo }
        })
        .sort({ createdAt: -1 })
        .limit(5);

        return {
          id: product.productId,
          name: product.name,
          currentStock: product.stock,
          price: product.price,
          category: product.category,
          recentMovements: recentMovements.map(movement => ({
            date: movement.createdAt,
            type: movement.movementType,
            change: movement.quantityChange,
            stockAfter: movement.quantityAfter
          }))
        };
      })
    );

    res.json({
      lowStockProducts: productsWithHistory,
      threshold,
      totalCount: lowStockProducts.length
    });
  } catch (error) {
    console.error('Error getting low stock with history:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stocks faibles' });
  }
};

/**
 * Utilitaire pour obtenir le label d'un type de mouvement
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

/**
 * 🔧 DEBUG: Endpoint pour vérifier le calcul du stock total
 */
export const debugStockCalculation = async (req, res) => {
  try {
    console.log('🔍 DEBUG: Calcul du stock total');
    
    // 1. Vérifier MongoDB
    const mongoProducts = await ProductMongo.find({}, { productId: 1, name: 1, stock: 1 });
    const mongoTotalStock = mongoProducts.reduce((total, product) => total + (product.stock || 0), 0);
    
    console.log('📊 MongoDB Products:', mongoProducts.length);
    console.log('📊 MongoDB Total Stock:', mongoTotalStock);
    
    // 2. Vérifier PostgreSQL
    const pgProducts = await Product.findAll({ 
      attributes: ['id', 'name', 'stock']
    });
    const pgTotalStock = pgProducts.reduce((total, product) => total + (product.stock || 0), 0);
    
    console.log('📊 PostgreSQL Products:', pgProducts.length);
    console.log('📊 PostgreSQL Total Stock:', pgTotalStock);
    
    // 3. Calcul MongoDB avec agrégation
    const mongoAggregation = await ProductMongo.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' },
          productCount: { $sum: 1 },
          minStock: { $min: '$stock' },
          maxStock: { $max: '$stock' },
          avgStock: { $avg: '$stock' }
        }
      }
    ]);
    
    console.log('📊 MongoDB Aggregation:', mongoAggregation[0]);
    
    res.json({
      debug: true,
      mongodb: {
        products: mongoProducts,
        totalStock: mongoTotalStock,
        productCount: mongoProducts.length,
        aggregation: mongoAggregation[0] || null
      },
      postgresql: {
        products: pgProducts.map(p => ({ id: p.id, name: p.name, stock: p.stock })),
        totalStock: pgTotalStock,
        productCount: pgProducts.length
      },
      comparison: {
        stockDifference: mongoTotalStock - pgTotalStock,
        productCountDifference: mongoProducts.length - pgProducts.length
      }
    });
  } catch (error) {
    console.error('❌ Erreur debug stock:', error);
    res.status(500).json({ error: 'Erreur lors du debug', details: error.message });
  }
}; 