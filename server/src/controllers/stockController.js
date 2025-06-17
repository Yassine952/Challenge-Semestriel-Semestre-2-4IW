import {
  recordStockMovement,
  getStockEvolution,
  getGlobalStockEvolution,
  getStockMovementsByType,
  getTopStockMovements
} from '../services/stockService.js';
import StockHistory from '../models/StockHistory.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';

export const getStockEvolutionChart = async (req, res) => {
  try {
    const { period = '3m' } = req.query;
    
    const evolution = await getGlobalStockEvolution(period);

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

export const getProductStockEvolution = async (req, res) => {
  try {
    const { productId } = req.params;
    const { period = '3m' } = req.query;
    
    const evolution = await getStockEvolution(productId, period);

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

export const getStockMovementsStats = async (req, res) => {
  try {
    const { period = '1m' } = req.query;
    
    const [movementsByType, topMovements] = await Promise.all([
      getStockMovementsByType(period),
      getTopStockMovements(period, 10)
    ]);

    const movementTypeChart = {
      labels: movementsByType.map(item => getMovementTypeLabel(item.type)),
      datasets: [{
        label: 'Quantité',
        data: movementsByType.map(item => item.totalQuantity),
        backgroundColor: [
          '#ef4444',
          '#22c55e',
          '#f59e0b',
          '#8b5cf6',
          '#06b6d4',
          '#84cc16',
          '#f97316',
          '#dc2626',
          '#6366f1',
          '#64748b'
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

    if (productId) {
      whereClause.productId = productId;
    }
    if (movementType) {
      whereClause.movementType = movementType;
    }

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

    if (!productId || !movementType || quantityChange === undefined) {
      return res.status(400).json({ 
        error: 'ProductId, movementType et quantityChange sont requis' 
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    if (product.stock + quantityChange < 0) {
      return res.status(400).json({ 
        error: 'Le stock ne peut pas être négatif' 
      });
    }

    const movement = await recordStockMovement({
      productId,
      userId,
      movementType,
      quantityChange,
      reason,
      cost,
      notes
    });

    await product.update({
      stock: product.stock + quantityChange
    });

    try {
      const { default: ProductMongo } = await import('../models/ProductMongo.js');
      await ProductMongo.updateOne(
        { productId },
        { stock: product.stock + quantityChange }
      );
    } catch (mongoError) {
      console.error('Error syncing with MongoDB:', mongoError);
    }

    res.status(201).json({
      message: 'Mouvement de stock enregistré avec succès',
      movement: {
        id: movement.id,
        productId: movement.productId,
        movementType: movement.movementType,
        quantityChange: movement.quantityChange,
        quantityAfter: movement.quantityAfter,
        createdAt: movement.createdAt
      }
    });
  } catch (error) {
    console.error('Error recording manual stock movement:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du mouvement de stock' });
  }
};

export const getLowStockWithHistory = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [Op.lte]: threshold
        }
      }
    });

    const productsWithHistory = await Promise.all(
      lowStockProducts.map(async (product) => {
        const recentMovements = await StockHistory.findAll({
          where: {
            productId: product.id,
            createdAt: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          order: [['createdAt', 'DESC']],
          limit: 5
        });

        return {
          id: product.id,
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