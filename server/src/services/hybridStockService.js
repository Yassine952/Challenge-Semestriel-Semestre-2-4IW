import StockHistory from '../models/StockHistory.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { checkProductStockThreshold } from '../controllers/alertController.js';

/**
 * 🔥 SERVICE HYBRIDE - ÉCRITURE DOUBLE PostgreSQL + MongoDB
 * ✅ Écrit dans PostgreSQL ET MongoDB automatiquement
 * ✅ Lit depuis MongoDB (performance maximale)
 * ✅ PostgreSQL reste la source de vérité
 */

// Import dynamique MongoDB
const getMongoModels = async () => {
  try {
    const { default: StockHistoryMongo } = await import('../models/StockHistoryMongo.js');
    const { default: ProductMongo } = await import('../models/ProductMongo.js');
    return { StockHistoryMongo, ProductMongo };
  } catch (error) {
    console.warn('⚠️ MongoDB non disponible:', error.message);
    return { StockHistoryMongo: null, ProductMongo: null };
  }
};

/**
 * 📊 ENREGISTREMENT MOUVEMENT STOCK (Double écriture)
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
    console.log(`🔄 Enregistrement mouvement: ${movementType} ${quantityChange} pour produit ${productId}`);

    // 1. Récupérer le produit
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    // ✅ Pour le stock initial, quantityBefore doit être 0, pas le stock actuel
    const quantityBefore = movementType === 'initial' ? 0 : product.stock;
    const quantityAfter = quantityBefore + quantityChange;
    const totalValue = cost ? Math.abs(quantityChange) * cost : null;

    // 2. Préparer les données
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

    // 3. 🔥 ÉCRITURE POSTGRESQL (Source de vérité)
    console.log('💾 Écriture PostgreSQL...');
    const stockMovement = await StockHistory.create(stockData);

    // 4. 🔥 ÉCRITURE MONGODB (Performance)
    try {
      console.log('💾 Écriture MongoDB...');
      const { StockHistoryMongo } = await getMongoModels();
      
      if (StockHistoryMongo) {
        const now = new Date();
        
        await StockHistoryMongo.create({
          ...stockData,
          stockHistoryId: stockMovement.id, // Lien vers PostgreSQL
          
          // 🚀 MÉTADONNÉES ENRICHIES
          metadata: {
            ...metadata,
            productName: product.name,
            productCategory: product.category,
            userEmail: metadata?.userEmail || null
          },
          
          // ⚡ OPTIMISATIONS TEMPORELLES
          dateInfo: {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
            hour: now.getHours(),
            weekday: now.getDay(),
            week: getWeekNumber(now)
          },
          
          createdAt: stockMovement.createdAt,
          updatedAt: stockMovement.updatedAt
        });
        
        console.log('✅ Double écriture réussie: PostgreSQL + MongoDB');
      } else {
        console.log('⚠️ MongoDB indisponible, seul PostgreSQL utilisé');
      }
    } catch (mongoError) {
      console.error('❌ Erreur MongoDB (PostgreSQL OK):', mongoError.message);
      // Ne pas faire échouer la transaction principale
    }

    return stockMovement;

  } catch (error) {
    console.error('❌ Erreur enregistrement mouvement:', error);
    throw error;
  }
};

/**
 * 📈 MISE À JOUR STOCK PRODUIT (Double écriture)
 */
export const updateProductStock = async (productId, newStock, reason = 'Mise à jour manuelle') => {
  try {
    console.log(`🔄 Mise à jour stock produit ${productId}: ${newStock}`);

    // 1. Mettre à jour PostgreSQL
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    const oldStock = product.stock;
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
        console.log('✅ Stock mis à jour: PostgreSQL + MongoDB');
      }
    } catch (mongoError) {
      console.warn('⚠️ Mise à jour MongoDB échouée');
    }

    return product;

  } catch (error) {
    console.error('❌ Erreur mise à jour stock:', error);
    throw error;
  }
};

/**
 * 📈 MODIFICATION RELATIVE STOCK PRODUIT + HISTORIQUE (Double écriture)
 * 🔥 NOUVELLE FONCTION pour les changements relatifs (réservations, ventes, etc.)
 */
export const updateProductStockRelative = async (
  productId, 
  quantityChange, 
  userId, 
  movementType, 
  reason, 
  reference,
  cost = null
) => {
  try {
    console.log(`🔄 Modification relative stock produit ${productId}: ${quantityChange > 0 ? '+' : ''}${quantityChange}`);

    // 1. Récupérer le produit actuel
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    const oldStock = product.stock;
    const newStock = oldStock + quantityChange;

    // 2. Vérifier que le stock ne devient pas négatif
    if (newStock < 0) {
      throw new Error(`Stock insuffisant. Stock actuel: ${oldStock}, demandé: ${Math.abs(quantityChange)}`);
    }

    // 3. Mettre à jour le stock dans PostgreSQL
    await product.update({ stock: newStock });

    // 4. Mettre à jour le stock dans MongoDB
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
        console.log('✅ Stock produit mis à jour: PostgreSQL + MongoDB');
      }
    } catch (mongoError) {
      console.warn('⚠️ Mise à jour stock MongoDB échouée');
    }

    // 5. Enregistrer le mouvement dans l'historique
    const movement = await recordStockMovement({
      productId,
      userId,
      movementType,
      quantityChange,
      reason,
      reference,
      cost,
      metadata: {
        productName: product.name,
        productCategory: product.category
      }
    });

    console.log(`✅ Mouvement stock enregistré: ${movementType} ${quantityChange > 0 ? '+' : ''}${quantityChange} unités`);

    // ✅ Vérification automatique du seuil de stock faible
    try {
      const alertSent = await checkProductStockThreshold(product, oldStock);
      if (alertSent) {
        console.log(`📧 Alerte de stock faible envoyée pour ${product.name}`);
      }
    } catch (alertError) {
      console.error('❌ Erreur lors de la vérification d\'alerte:', alertError);
      // Ne pas faire échouer la transaction principale
    }

    return {
      product: await product.reload(),
      movement,
      oldStock,
      newStock
    };

  } catch (error) {
    console.error('❌ Erreur modification relative stock:', error);
    throw error;
  }
};

/**
 * 🏪 CRÉATION PRODUIT (Double écriture)
 */
export const createProduct = async (productData) => {
  try {
    console.log('🔄 Création produit:', productData.name);

    // 1. Créer dans PostgreSQL
    const product = await Product.create(productData);

    // 2. Créer dans MongoDB
    try {
      const { ProductMongo } = await getMongoModels();
      if (ProductMongo) {
        await ProductMongo.create({
          ...productData,
          productId: product.id,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        });
        console.log('✅ Produit créé: PostgreSQL + MongoDB');
      }
    } catch (mongoError) {
      console.warn('⚠️ Création MongoDB échouée');
    }

    // 3. Enregistrer le stock initial
    if (product.stock > 0) {
      // ✅ Pour le stock initial, on enregistre le mouvement avec quantityBefore = 0
      // pour que quantityAfter soit correct (0 + stock = stock)
      await recordStockMovement({
        productId: product.id,
        movementType: 'initial',
        quantityChange: product.stock,
        reason: 'Stock initial à la création du produit'
      });
    }

    return product;

  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    throw error;
  }
};

/**
 * 📊 LECTURE DONNÉES (MongoDB prioritaire)
 * Utilise MongoDB pour toutes les lectures (graphiques, stats)
 */

/**
 * Évolution globale des stocks (MongoDB)
 * 🔧 SOLUTION SIMPLIFIÉE: Calcul direct du stock total actuel
 */
export const getGlobalStockEvolution = async (period = '3m') => {
  try {
    const { StockHistoryMongo, ProductMongo } = await getMongoModels();
    if (!StockHistoryMongo || !ProductMongo) {
      throw new Error('MongoDB non disponible');
    }

    console.log('📊 Lecture évolution globale depuis MongoDB - Version simplifiée');
    
    // 🔥 SOLUTION DIRECTE: Calculer le stock total actuel de tous les produits
    const currentStockResult = await ProductMongo.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' },
          productCount: { $sum: 1 },
          minStock: { $min: '$stock' },
          maxStock: { $max: '$stock' }
        }
      }
    ]);

    if (currentStockResult.length === 0) {
      console.log('📊 Aucun produit trouvé dans MongoDB');
      return [{
        date: new Date(),
        totalStock: 0,
        productCount: 0
      }];
    }

    const currentData = currentStockResult[0];
    console.log('📊 Stock actuel calculé:', currentData);

    // Essayer de récupérer l'historique pour créer une évolution
    try {
      const matchStage = getMongoMatchStage(period);
      
      const historyPipeline = [
        { $match: matchStage },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              productId: '$productId'
            },
            latestStock: { $last: '$quantityAfter' },
            date: { $last: '$createdAt' }
          }
        },
        {
          $group: {
            _id: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            },
            totalStock: { $sum: '$latestStock' },
            date: { $last: '$date' },
            productCount: { $sum: 1 }
          }
        },
        { $sort: { 'date': 1 } },
        {
          $project: {
            _id: 0,
            date: '$date',
            totalStock: '$totalStock',
            productCount: '$productCount'
          }
        }
      ];

      const historyResults = await StockHistoryMongo.aggregate(historyPipeline);
      
      if (historyResults.length > 0) {
        console.log(`📊 Historique trouvé: ${historyResults.length} points de données`);
        return historyResults;
      }
    } catch (historyError) {
      console.warn('⚠️ Erreur historique MongoDB:', historyError.message);
    }

    // Fallback : retourner seulement le stock actuel
    console.log('📊 Pas d\'historique, retour du stock actuel uniquement');
    return [{
      date: new Date(),
      totalStock: currentData.totalStock,
      productCount: currentData.productCount
    }];

  } catch (error) {
    console.error('❌ Erreur lecture MongoDB, fallback PostgreSQL');
    return await getGlobalStockEvolutionPostgres(period);
  }
};

/**
 * Évolution produit spécifique (MongoDB)
 */
export const getProductStockEvolution = async (productId, period = '3m') => {
  try {
    const { StockHistoryMongo } = await getMongoModels();
    if (!StockHistoryMongo) {
      throw new Error('MongoDB non disponible');
    }

    console.log(`📊 Lecture évolution produit ${productId} depuis MongoDB`);

    const matchStage = {
      ...getMongoMatchStage(period),
      productId: parseInt(productId)
    };
    
    const pipeline = [
      { $match: matchStage },
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

  } catch (error) {
    console.error('❌ Erreur lecture MongoDB, fallback PostgreSQL');
    return await getProductStockEvolutionPostgres(productId, period);
  }
};

/**
 * Statistiques par type de mouvement (MongoDB)
 */
export const getStockMovementsByType = async (period = '1m') => {
  try {
    const { StockHistoryMongo } = await getMongoModels();
    if (!StockHistoryMongo) {
      throw new Error('MongoDB non disponible');
    }

    console.log('📊 Lecture stats mouvements depuis MongoDB');

    const matchStage = getMongoMatchStage(period);
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$movementType',
          count: { $sum: 1 },
          totalQuantity: { $sum: { $abs: '$quantityChange' } },
          totalValue: { $sum: { $ifNull: ['$totalValue', 0] } }
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
      { $sort: { totalQuantity: -1 } }
    ];

    return await StockHistoryMongo.aggregate(pipeline);

  } catch (error) {
    console.error('❌ Erreur lecture MongoDB, fallback PostgreSQL');
    return await getStockMovementsByTypePostgres(period);
  }
};

/**
 * 🛠️ UTILITAIRES
 */

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
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

  return { createdAt: { $gte: startDate } };
};

/**
 * 🔄 FALLBACKS POSTGRESQL (si MongoDB indisponible)
 */

const getGlobalStockEvolutionPostgres = async (period) => {
  // 🔧 CORRECTION: Fallback PostgreSQL avec calcul correct du stock total
  console.log('📊 Fallback PostgreSQL pour évolution globale');
  
  try {
    // Calculer le stock total actuel de tous les produits
    const currentStocks = await Product.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('stock')), 'totalStock'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'productCount']
      ]
    });
    
    const totalStock = currentStocks[0]?.dataValues?.totalStock || 0;
    const productCount = currentStocks[0]?.dataValues?.productCount || 0;
    
    return [{
      date: new Date(),
      totalStock: parseInt(totalStock),
      productCount: parseInt(productCount)
    }];
  } catch (error) {
    console.error('❌ Erreur fallback PostgreSQL:', error);
    return [];
  }
};

const getProductStockEvolutionPostgres = async (productId, period) => {
  console.log(`📊 Fallback PostgreSQL pour produit ${productId}`);
  // Implementation PostgreSQL de base
  return [];
};

const getStockMovementsByTypePostgres = async (period) => {
  console.log('📊 Fallback PostgreSQL pour stats mouvements');
  // Implementation PostgreSQL de base
  return [];
}; 