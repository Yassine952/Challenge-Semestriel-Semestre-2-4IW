import StockHistory from '../models/StockHistory.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Enregistre un mouvement de stock
 */
export const recordStockMovement = async ({
  productId,
  userId = null,
  movementType,
  quantityChange,
  reason = null,
  reference = null,
  cost = null,
  notes = null,
  metadata = null
}) => {
  try {
    // Récupérer le produit pour connaître le stock actuel
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    const quantityBefore = product.stock;
    const quantityAfter = quantityBefore + quantityChange;

    // Calculer la valeur totale si le coût est fourni
    const totalValue = cost ? Math.abs(quantityChange) * cost : null;

    // Enregistrer le mouvement
    const stockMovement = await StockHistory.create({
      productId,
      userId,
      movementType,
      quantityBefore,
      quantityChange,
      quantityAfter,
      reason,
      reference,
      cost,
      totalValue,
      notes,
      metadata
    });

    console.log(`Stock movement recorded: ${movementType} ${quantityChange} for product ${productId}`);
    return stockMovement;

  } catch (error) {
    console.error('Error recording stock movement:', error);
    throw error;
  }
};

/**
 * Obtient l'évolution des stocks pour un produit
 */
export const getStockEvolution = async (productId, period = '3m') => {
  try {
    const periodFilter = getPeriodFilter(period);
    
    const movements = await StockHistory.findAll({
      where: {
        productId,
        createdAt: periodFilter
      },
      order: [['createdAt', 'ASC']],
      include: [{
        model: Product,
        attributes: ['name']
      }]
    });

    return movements.map(movement => ({
      date: movement.createdAt,
      stock: movement.quantityAfter,
      change: movement.quantityChange,
      type: movement.movementType,
      reason: movement.reason,
      reference: movement.reference
    }));

  } catch (error) {
    console.error('Error getting stock evolution:', error);
    throw error;
  }
};

/**
 * Obtient l'évolution globale des stocks
 */
export const getGlobalStockEvolution = async (period = '3m') => {
  try {
    const periodFilter = getPeriodFilter(period);
    
    // Obtenir toutes les dates uniques dans la période
    const dates = await StockHistory.findAll({
      where: { createdAt: periodFilter },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Si pas de données historiques, utiliser les stocks actuels
    if (dates.length === 0) {
      const totalCurrentStock = await Product.sum('stock');
      const today = new Date().toISOString().split('T')[0];
      
      return [{
        date: today,
        totalStock: totalCurrentStock || 0
      }];
    }

    // Pour chaque date, calculer le stock total de tous les produits
    const evolution = [];
    for (const dateRow of dates) {
      const date = dateRow.date;
      
      // Obtenir tous les produits
      const products = await Product.findAll({
        attributes: ['id', 'stock']
      });
      
      let totalStockForDate = 0;
      
      // Pour chaque produit, trouver son stock à cette date
      for (const product of products) {
        // Trouver le dernier mouvement de ce produit avant/à cette date
        const lastMovement = await StockHistory.findOne({
          where: {
            productId: product.id,
            createdAt: {
              [Op.lte]: new Date(date + 'T23:59:59')
            }
          },
          order: [['createdAt', 'DESC']]
        });
        
        if (lastMovement) {
          totalStockForDate += lastMovement.quantityAfter;
        } else {
          // Si pas de mouvement, utiliser le stock actuel (cas initial)
          totalStockForDate += product.stock;
        }
      }
      
      evolution.push({
        date: date,
        totalStock: totalStockForDate
      });
    }

    return evolution;

  } catch (error) {
    console.error('Error getting global stock evolution:', error);
    throw error;
  }
};

/**
 * Obtient les mouvements de stock par type
 */
export const getStockMovementsByType = async (period = '1m') => {
  try {
    const periodFilter = getPeriodFilter(period);
    
    const movements = await StockHistory.findAll({
      where: {
        createdAt: periodFilter
      },
      attributes: [
        'movementType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.fn('ABS', sequelize.col('quantityChange'))), 'totalQuantity']
      ],
      group: ['movementType'],
      raw: true
    });

    return movements.map(movement => ({
      type: movement.movementType,
      count: parseInt(movement.count),
      totalQuantity: parseInt(movement.totalQuantity) || 0
    }));

  } catch (error) {
    console.error('Error getting stock movements by type:', error);
    throw error;
  }
};

/**
 * Obtient les produits avec les plus gros mouvements de stock
 */
export const getTopStockMovements = async (period = '1m', limit = 10) => {
  try {
    const periodFilter = getPeriodFilter(period);
    
    const movements = await StockHistory.findAll({
      where: {
        createdAt: periodFilter
      },
      attributes: [
        'productId',
        [sequelize.fn('COUNT', sequelize.col('StockHistory.id')), 'movementCount'],
        [sequelize.fn('SUM', sequelize.fn('ABS', sequelize.col('quantityChange'))), 'totalQuantity']
      ],
      include: [{
        model: Product,
        attributes: ['name', 'stock']
      }],
      group: ['productId', 'Product.id'],
      order: [[sequelize.fn('SUM', sequelize.fn('ABS', sequelize.col('quantityChange'))), 'DESC']],
      limit,
      subQuery: false
    });

    return movements.map(movement => ({
      productId: movement.productId,
      productName: movement.Product.name,
      currentStock: movement.Product.stock,
      movementCount: parseInt(movement.get('movementCount')),
      totalQuantity: parseInt(movement.get('totalQuantity')) || 0
    }));

  } catch (error) {
    console.error('Error getting top stock movements:', error);
    throw error;
  }
};

/**
 * Filtre de période utilitaire
 */
const getPeriodFilter = (period) => {
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
    case '6m':
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 3 mois par défaut
  }

  return {
    [Op.gte]: startDate
  };
};

 