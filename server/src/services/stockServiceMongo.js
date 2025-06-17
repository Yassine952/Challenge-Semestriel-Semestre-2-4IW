import StockHistoryMongo from '../models/StockHistoryMongo.js';

export const getGlobalStockEvolutionMongo = async (period = '3m') => {
  try {
    const matchStage = getMongoMatchStage(period);
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: '$dateInfo.year',
            month: '$dateInfo.month',
            day: '$dateInfo.day'
          },
          totalStock: { $last: '$quantityAfter' },
          movements: { $sum: 1 },
          date: { $last: '$createdAt' }
        }
      },
      {
        $sort: { 'date': 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$date',
          totalStock: '$totalStock',
          movements: '$movements'
        }
      }
    ];

    const results = await StockHistoryMongo.aggregate(pipeline);
    
    return results.map(item => ({
      date: item.date,
      totalStock: item.totalStock,
      movements: item.movements
    }));

  } catch (error) {
    console.error('Error in getGlobalStockEvolutionMongo:', error);
    throw error;
  }
};

export const getProductStockEvolutionMongo = async (productId, period = '3m') => {
  try {
    const matchStage = {
      ...getMongoMatchStage(period),
      productId: parseInt(productId)
    };
    
    const pipeline = [
      { $match: matchStage },
      {
        $sort: { createdAt: 1 }
      },
      {
        $project: {
          date: '$createdAt',
          stock: '$quantityAfter',
          change: '$quantityChange',
          type: '$movementType',
          reason: '$reason',
          reference: '$reference',
          productName: '$metadata.productName'
        }
      }
    ];

    const results = await StockHistoryMongo.aggregate(pipeline);
    
    return results.map(item => ({
      date: item.date,
      stock: item.stock,
      change: item.change,
      type: item.type,
      reason: item.reason,
      reference: item.reference,
      productName: item.productName
    }));

  } catch (error) {
    console.error('Error in getProductStockEvolutionMongo:', error);
    throw error;
  }
};

export const getStockMovementsByTypeMongo = async (period = '1m') => {
  try {
    const matchStage = getMongoMatchStage(period);
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$movementType',
          count: { $sum: 1 },
          totalQuantity: { 
            $sum: { 
              $abs: '$quantityChange' 
            } 
          },
          totalValue: { 
            $sum: { 
              $ifNull: ['$totalValue', 0] 
            } 
          }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: '$count',
          totalQuantity: '$totalQuantity',
          totalValue: '$totalValue'
        }
      },
      {
        $sort: { totalQuantity: -1 }
      }
    ];

    return await StockHistoryMongo.aggregate(pipeline);

  } catch (error) {
    console.error('Error in getStockMovementsByTypeMongo:', error);
    throw error;
  }
};

export const getTopStockMovementsMongo = async (period = '1m', limit = 10) => {
  try {
    const matchStage = getMongoMatchStage(period);
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$productId',
          productName: { $last: '$metadata.productName' },
          category: { $last: '$metadata.productCategory' },
          movementCount: { $sum: 1 },
          totalQuantity: { 
            $sum: { 
              $abs: '$quantityChange' 
            } 
          },
          currentStock: { $last: '$quantityAfter' },
          lastMovement: { $last: '$createdAt' }
        }
      },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          productName: '$productName',
          category: '$category',
          movementCount: '$movementCount',
          totalQuantity: '$totalQuantity',
          currentStock: '$currentStock',
          lastMovement: '$lastMovement'
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: limit
      }
    ];

    return await StockHistoryMongo.aggregate(pipeline);

  } catch (error) {
    console.error('Error in getTopStockMovementsMongo:', error);
    throw error;
  }
};

export const getStockAnalyticsMongo = async (period = '1m') => {
  try {
    const matchStage = getMongoMatchStage(period);
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            hour: '$dateInfo.hour',
            weekday: '$dateInfo.weekday'
          },
          avgMovements: { $avg: { $abs: '$quantityChange' } },
          totalMovements: { $sum: 1 },
          stockVariation: { 
            $avg: { 
              $subtract: ['$quantityAfter', '$quantityBefore'] 
            } 
          }
        }
      },
      {
        $project: {
          _id: 0,
          hour: '$_id.hour',
          weekday: '$_id.weekday',
          avgMovements: { $round: ['$avgMovements', 2] },
          totalMovements: '$totalMovements',
          stockVariation: { $round: ['$stockVariation', 2] }
        }
      },
      {
        $sort: { weekday: 1, hour: 1 }
      }
    ];

    return await StockHistoryMongo.aggregate(pipeline);

  } catch (error) {
    console.error('Error in getStockAnalyticsMongo:', error);
    throw error;
  }
};

export const getLowStockWithContextMongo = async (threshold = 10) => {
  try {
    const pipeline = [
      {
        $match: {
          quantityAfter: { $lte: threshold },
          createdAt: { 
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          }
        }
      },
      {
        $group: {
          _id: '$productId',
          productName: { $last: '$metadata.productName' },
          category: { $last: '$metadata.productCategory' },
          currentStock: { $last: '$quantityAfter' },
          recentMovements: {
            $push: {
              date: '$createdAt',
              type: '$movementType',
              change: '$quantityChange',
              stockAfter: '$quantityAfter',
              reason: '$reason'
            }
          },
          lastSale: {
            $last: {
              $cond: [
                { $eq: ['$movementType', 'sale'] },
                '$createdAt',
                null
              ]
            }
          },
          lastRestock: {
            $last: {
              $cond: [
                { $eq: ['$movementType', 'purchase'] },
                '$createdAt',
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          productName: '$productName',
          category: '$category',
          currentStock: '$currentStock',
          recentMovements: { $slice: ['$recentMovements', -5] },
          lastSale: '$lastSale',
          lastRestock: '$lastRestock',
          urgency: {
            $cond: [
              { $lte: ['$currentStock', 5] },
              'critical',
              'warning'
            ]
          }
        }
      },
      {
        $sort: { currentStock: 1 }
      }
    ];

    return await StockHistoryMongo.aggregate(pipeline);

  } catch (error) {
    console.error('Error in getLowStockWithContextMongo:', error);
    throw error;
  }
};

const getMongoMatchStage = (period) => {
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
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }

  return {
    createdAt: { $gte: startDate }
  };
}; 