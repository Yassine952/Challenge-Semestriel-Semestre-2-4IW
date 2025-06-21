import StockHistory from '../models/StockHistory.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';

/**
 * 🔥 SERVICE DOUBLE ÉCRITURE PostgreSQL + MongoDB
 * Écrit dans les 2 bases automatiquement pour éviter la synchronisation
 */

// Import dynamique MongoDB pour éviter les erreurs si non connecté
const getMongoModels = async () => {
  try {
    const { default: StockHistoryMongo } = await import('../models/StockHistoryMongo.js');
    const { default: ProductMongo } = await import('../models/ProductMongo.js');
    return { StockHistoryMongo, ProductMongo };
  } catch (error) {
    console.warn('MongoDB non disponible:', error.message);
    return { StockHistoryMongo: null, ProductMongo: null };
  }
};

/**
 * Enregistre un mouvement de stock dans PostgreSQL ET MongoDB
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
    // 1. Récupérer le produit pour connaître le stock actuel
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    const quantityBefore = product.stock;
    const quantityAfter = quantityBefore + quantityChange;
    const totalValue = cost ? Math.abs(quantityChange) * cost : null;

    // 2. 🔥 DOUBLE ÉCRITURE : PostgreSQL + MongoDB
    const stockData = {
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
    };

    // Écriture PostgreSQL (obligatoire)
    const stockMovement = await StockHistory.create(stockData);

    // Écriture MongoDB (optionnelle)
    try {
      const { StockHistoryMongo } = await getMongoModels();
      if (StockHistoryMongo) {
        const createdAt = new Date();
        
        await StockHistoryMongo.create({
          ...stockData,
          stockHistoryId: stockMovement.id,
          
          // Métadonnées enrichies
          metadata: {
            ...metadata,
            productName: product.name,
            productCategory: product.category
          },
          
          // Optimisations temporelles
          dateInfo: {
            year: createdAt.getFullYear(),
            month: createdAt.getMonth() + 1,
            day: createdAt.getDate(),
            hour: createdAt.getHours(),
            weekday: createdAt.getDay(),
            week: Math.ceil(((createdAt - new Date(createdAt.getFullYear(), 0, 1)) / 86400000 + new Date(createdAt.getFullYear(), 0, 1).getDay() + 1) / 7)
          },
          
          createdAt,
          updatedAt: createdAt
        });
        
        console.log('✅ Mouvement écrit dans PostgreSQL + MongoDB');
      }
    } catch (mongoError) {
      console.warn('⚠️  MongoDB non disponible, seul PostgreSQL utilisé:', mongoError.message);
    }

    console.log(`📊 Stock movement: ${movementType} ${quantityChange} for product ${productId}`);
    return stockMovement;

  } catch (error) {
    console.error('❌ Error recording stock movement:', error);
    throw error;
  }
};

/**
 * Met à jour le stock d'un produit dans les 2 bases
 */
export const updateProductStock = async (productId, newStock) => {
  try {
    // 1. Mettre à jour PostgreSQL
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produit non trouvé');
    }
    
    await product.update({ stock: newStock });

    // 2. Mettre à jour MongoDB
    try {
      const { ProductMongo } = await getMongoModels();
      if (ProductMongo) {
        await ProductMongo.updateOne(
          { productId },
          { 
            stock: newStock,
            updatedAt: new Date()
          },
          { upsert: true }
        );
        console.log('✅ Stock mis à jour dans PostgreSQL + MongoDB');
      }
    } catch (mongoError) {
      console.warn('⚠️  MongoDB non disponible pour la mise à jour stock');
    }

    return product;

  } catch (error) {
    console.error('❌ Error updating product stock:', error);
    throw error;
  }
};

/**
 * Crée un produit dans les 2 bases
 */
export const createProduct = async (productData) => {
  try {
    // 1. Créer dans PostgreSQL
    const product = await Product.create(productData);

    // 2. Créer dans MongoDB
    try {
      const { ProductMongo } = await getMongoModels();
      if (ProductMongo) {
        await ProductMongo.create({
          ...productData,
          productId: product.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ Produit créé dans PostgreSQL + MongoDB');
      }
    } catch (mongoError) {
      console.warn('⚠️  MongoDB non disponible pour la création produit');
    }

    return product;

  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }
};

/**
 * Obtient l'évolution des stocks (depuis MongoDB si disponible, sinon PostgreSQL)
 */
export const getStockEvolution = async (productId, period = '3m') => {
  try {
    // Essayer MongoDB d'abord (plus rapide)
    try {
      const { StockHistoryMongo } = await getMongoModels();
      if (StockHistoryMongo) {
        const count = await StockHistoryMongo.countDocuments({ productId });
        if (count > 0) {
          console.log('📊 Utilisation MongoDB pour getStockEvolution');
          return await getStockEvolutionMongo(productId, period);
        }
      }
    } catch (mongoError) {
      console.warn('MongoDB non disponible, fallback PostgreSQL');
    }

    // Fallback PostgreSQL
    console.log('📊 Utilisation PostgreSQL pour getStockEvolution');
    return await getStockEvolutionPostgres(productId, period);

  } catch (error) {
    console.error('Error getting stock evolution:', error);
    throw error;
  }
};

/**
 * Évolution depuis MongoDB
 */
const getStockEvolutionMongo = async (productId, period) => {
  const { StockHistoryMongo } = await getMongoModels();
  const matchStage = getMongoMatchStage(period);
  
  const pipeline = [
    { $match: { ...matchStage, productId: parseInt(productId) } },
    { $sort: { createdAt: 1 } },
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
};

/**
 * Évolution depuis PostgreSQL
 */
const getStockEvolutionPostgres = async (productId, period) => {
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
    reference: movement.reference,
    productName: movement.Product?.name
  }));
};

/**
 * Utilitaires
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
    default:
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }
  
  return { [Op.gte]: startDate };
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