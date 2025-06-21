import { recordStockMovement, updateProductStock } from '../services/hybridStockService.js';

/**
 * 🔥 MIDDLEWARE ÉCRITURE DOUBLE AUTOMATIQUE
 * Intercepte toutes les opérations de stock pour écrire automatiquement
 * dans PostgreSQL ET MongoDB
 */

/**
 * Middleware pour enregistrer automatiquement les mouvements de stock
 */
export const autoRecordStockMovement = (movementType, options = {}) => {
  return async (req, res, next) => {
    try {
      // Ajouter la fonction d'enregistrement à la requête
      req.recordStockMovement = async (data) => {
        return await recordStockMovement({
          movementType,
          ...data,
          ...options,
          userId: req.user?.id || null,
          metadata: {
            ...data.metadata,
            userEmail: req.user?.email,
            endpoint: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString(),
            ...options.metadata
          }
        });
      };

      next();
    } catch (error) {
      console.error('❌ Erreur middleware autoRecordStockMovement:', error);
      next(error);
    }
  };
};

/**
 * Middleware pour intercepter les modifications de produits
 */
export const interceptProductUpdates = async (req, res, next) => {
  try {
    // Sauvegarder la méthode originale res.json
    const originalJson = res.json;
    
    // Intercepter la réponse
    res.json = function(data) {
      // Si c'est une modification de stock réussie
      if (data && data.success && data.product && req.stockChange) {
        // Enregistrer le mouvement automatiquement (async, ne bloque pas la réponse)
        recordStockMovement({
          productId: data.product.id,
          userId: req.user?.id || null,
          movementType: req.stockMovementType || 'adjustment',
          quantityChange: req.stockChange,
          reason: req.stockReason || 'Modification via API',
          reference: req.stockReference || null,
          metadata: {
            userEmail: req.user?.email,
            endpoint: req.originalUrl,
            previousStock: req.previousStock,
            newStock: data.product.stock,
            automatic: true
          }
        }).catch(error => {
          console.error('❌ Erreur enregistrement mouvement automatique:', error);
        });
      }
      
      // Appeler la méthode originale
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    console.error('❌ Erreur middleware interceptProductUpdates:', error);
    next(error);
  }
};

/**
 * Middleware spécialisé pour les ventes
 */
export const recordSaleMovement = autoRecordStockMovement('sale', {
  metadata: { source: 'vente' }
});

/**
 * Middleware spécialisé pour les achats/réapprovisionnements
 */
export const recordPurchaseMovement = autoRecordStockMovement('purchase', {
  metadata: { source: 'achat' }
});

/**
 * Middleware spécialisé pour les ajustements
 */
export const recordAdjustmentMovement = autoRecordStockMovement('adjustment', {
  metadata: { source: 'ajustement' }
});

/**
 * Middleware spécialisé pour les retours
 */
export const recordReturnMovement = autoRecordStockMovement('return', {
  metadata: { source: 'retour' }
});

/**
 * Middleware de vérification de cohérence
 */
export const verifyStockConsistency = async (req, res, next) => {
  try {
    // Ajouter une fonction de vérification à la requête
    req.verifyStock = async (productId) => {
      try {
        // Import dynamique pour éviter les dépendances circulaires
        const { default: Product } = await import('../models/Product.js');
        const { default: ProductMongo } = await import('../models/ProductMongo.js');
        
        const pgProduct = await Product.findByPk(productId);
        const mongoProduct = await ProductMongo.findOne({ productId });
        
        if (pgProduct && mongoProduct && pgProduct.stock !== mongoProduct.stock) {
          console.warn(`⚠️ INCOHÉRENCE STOCK détectée pour produit ${productId}:`);
          console.warn(`PostgreSQL: ${pgProduct.stock}, MongoDB: ${mongoProduct.stock}`);
          
          // PostgreSQL fait foi, corriger MongoDB
          await ProductMongo.updateOne(
            { productId },
            { stock: pgProduct.stock, updatedAt: new Date() }
          );
          
          console.log(`✅ MongoDB corrigé: ${pgProduct.stock}`);
        }
        
        return { consistent: true, pgStock: pgProduct?.stock, mongoStock: mongoProduct?.stock };
      } catch (error) {
        console.error('❌ Erreur vérification cohérence:', error);
        return { consistent: false, error: error.message };
      }
    };

    next();
  } catch (error) {
    console.error('❌ Erreur middleware verifyStockConsistency:', error);
    next(error);
  }
};

/**
 * Middleware de monitoring des performances
 */
export const monitorPerformance = async (req, res, next) => {
  try {
    const startTime = Date.now();
    
    // Intercepter la fin de la requête
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      if (duration > 1000) { // Si > 1 seconde
        console.warn(`⚠️ REQUÊTE LENTE (${duration}ms): ${req.method} ${req.originalUrl}`);
      }
      
      // Log des performances par type d'opération
      if (req.originalUrl.includes('/stock/')) {
        console.log(`📊 Performance Stock (${duration}ms): ${req.method} ${req.originalUrl}`);
      }
    });

    next();
  } catch (error) {
    console.error('❌ Erreur middleware monitorPerformance:', error);
    next(error);
  }
};

/**
 * Middleware de fallback PostgreSQL
 */
export const postgresqlFallback = async (req, res, next) => {
  try {
    // Ajouter un flag pour indiquer si MongoDB est disponible
    req.mongoAvailable = true;
    
    // Tester la connexion MongoDB
    try {
      const { default: ProductMongo } = await import('../models/ProductMongo.js');
      await ProductMongo.findOne().limit(1);
    } catch (error) {
      console.warn('⚠️ MongoDB indisponible, mode PostgreSQL seul activé');
      req.mongoAvailable = false;
    }

    next();
  } catch (error) {
    console.error('❌ Erreur middleware postgresqlFallback:', error);
    next(error);
  }
}; 