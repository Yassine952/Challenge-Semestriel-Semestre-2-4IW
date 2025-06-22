/**
 * 🔧 CORRECTION DES STOCKS NÉGATIFS
 * Script pour diagnostiquer et corriger les problèmes de stocks négatifs
 */

import dotenv from 'dotenv';
import sequelize from './src/config/database.js';
import Product from './src/models/Product.js';
import StockHistory from './src/models/StockHistory.js';
import mongoose from 'mongoose';

dotenv.config();

// Connexion MongoDB
const connectMongo = async () => {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  await mongoose.connect(mongoUrl);
  console.log('✅ MongoDB connecté');
};

// Import dynamique MongoDB
const getMongoModels = async () => {
  try {
    const { default: ProductMongo } = await import('./src/models/ProductMongo.js');
    const { default: StockHistoryMongo } = await import('./src/models/StockHistoryMongo.js');
    return { ProductMongo, StockHistoryMongo };
  } catch (error) {
    console.error('❌ Erreur import MongoDB:', error);
    return { ProductMongo: null, StockHistoryMongo: null };
  }
};

/**
 * 🔍 Diagnostic des stocks négatifs
 */
const diagnoseNegativeStocks = async () => {
  console.log('🔍 DIAGNOSTIC DES STOCKS NÉGATIFS');
  console.log('==================================');
  
  try {
    // Connexions
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connecté');
    
    try {
      await connectMongo();
      var { ProductMongo, StockHistoryMongo } = await getMongoModels();
    } catch (mongoError) {
      console.warn('⚠️ MongoDB non disponible:', mongoError.message);
    }
    
    // 1. Vérifier PostgreSQL
    console.log('\n📊 ANALYSE POSTGRESQL:');
    const pgProducts = await Product.findAll({
      attributes: ['id', 'name', 'stock'],
      order: [['stock', 'ASC']]
    });
    
    const negativeStocksPG = pgProducts.filter(p => p.stock < 0);
    console.log(`📦 Total produits: ${pgProducts.length}`);
    console.log(`❌ Stocks négatifs: ${negativeStocksPG.length}`);
    
    if (negativeStocksPG.length > 0) {
      console.log('\n⚠️ PRODUITS AVEC STOCKS NÉGATIFS (PostgreSQL):');
      negativeStocksPG.forEach(product => {
        console.log(`  - ${product.name} (ID: ${product.id}): ${product.stock} unités`);
      });
    }
    
    // 2. Vérifier MongoDB si disponible
    if (ProductMongo) {
      console.log('\n📊 ANALYSE MONGODB:');
      const mongoProducts = await ProductMongo.find({}, { productId: 1, name: 1, stock: 1 }).sort({ stock: 1 });
      const negativeStocksMongo = mongoProducts.filter(p => p.stock < 0);
      
      console.log(`📦 Total produits: ${mongoProducts.length}`);
      console.log(`❌ Stocks négatifs: ${negativeStocksMongo.length}`);
      
      if (negativeStocksMongo.length > 0) {
        console.log('\n⚠️ PRODUITS AVEC STOCKS NÉGATIFS (MongoDB):');
        negativeStocksMongo.forEach(product => {
          console.log(`  - ${product.name} (ID: ${product.productId}): ${product.stock} unités`);
        });
      }
      
      // 3. Comparer PostgreSQL vs MongoDB
      console.log('\n⚖️ COMPARAISON PG vs MONGO:');
      for (const pgProduct of pgProducts) {
        const mongoProduct = mongoProducts.find(m => m.productId === pgProduct.id);
        if (mongoProduct && pgProduct.stock !== mongoProduct.stock) {
          console.log(`🔄 DÉSYNCHRONISATION détectée pour ${pgProduct.name}:`);
          console.log(`   PostgreSQL: ${pgProduct.stock}, MongoDB: ${mongoProduct.stock}`);
        }
      }
    }
    
    // 4. Analyser l'historique pour les produits négatifs
    if (negativeStocksPG.length > 0) {
      console.log('\n📋 ANALYSE HISTORIQUE DES MOUVEMENTS:');
      for (const product of negativeStocksPG) {
        console.log(`\n🔍 Historique pour ${product.name} (stock actuel: ${product.stock}):`);
        
        const movements = await StockHistory.findAll({
          where: { productId: product.id },
          order: [['createdAt', 'DESC']],
          limit: 10
        });
        
        console.log(`   Derniers mouvements (${movements.length}):`);
        movements.forEach((mov, index) => {
          console.log(`   ${index + 1}. ${mov.movementType}: ${mov.quantityBefore} → ${mov.quantityAfter} (${mov.quantityChange > 0 ? '+' : ''}${mov.quantityChange}) - ${mov.createdAt.toISOString()}`);
        });
        
        // Vérifier la cohérence des calculs
        if (movements.length > 0) {
          const lastMovement = movements[0];
          if (lastMovement.quantityAfter !== product.stock) {
            console.log(`   ⚠️ INCOHÉRENCE: Dernier mouvement dit ${lastMovement.quantityAfter}, produit a ${product.stock}`);
          }
        }
      }
    }
    
    return { negativeStocksPG, negativeStocksMongo: ProductMongo ? negativeStocksMongo : [] };
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
    throw error;
  }
};

/**
 * 🔧 Correction des stocks négatifs
 */
const fixNegativeStocks = async (negativeProducts, fixMode = 'recalculate') => {
  console.log('\n🔧 CORRECTION DES STOCKS NÉGATIFS');
  console.log('==================================');
  
  if (negativeProducts.length === 0) {
    console.log('✅ Aucun stock négatif à corriger');
    return;
  }
  
  const { ProductMongo } = await getMongoModels();
  
  for (const product of negativeProducts) {
    console.log(`\n🔧 Correction de ${product.name} (ID: ${product.id}):`);
    console.log(`   Stock actuel: ${product.stock}`);
    
    if (fixMode === 'recalculate') {
      // Recalculer le stock basé sur l'historique
      const movements = await StockHistory.findAll({
        where: { productId: product.id },
        order: [['createdAt', 'ASC']]
      });
      
      let calculatedStock = 0;
      let stockInitial = movements.find(m => m.movementType === 'initial');
      
      if (stockInitial) {
        calculatedStock = stockInitial.quantityAfter;
        console.log(`   Stock initial trouvé: ${calculatedStock}`);
        
        // Appliquer tous les mouvements après l'initial
        const postInitialMovements = movements.filter(m => m.id > stockInitial.id);
        for (const mov of postInitialMovements) {
          calculatedStock += mov.quantityChange;
        }
      } else {
        // Pas de stock initial, calculer depuis le début
        for (const mov of movements) {
          calculatedStock += mov.quantityChange;
        }
      }
      
      console.log(`   Stock recalculé: ${calculatedStock}`);
      
      if (calculatedStock !== product.stock) {
        console.log(`   🔄 Correction nécessaire: ${product.stock} → ${calculatedStock}`);
        
        // Corriger PostgreSQL
        await product.update({ stock: calculatedStock });
        
        // Corriger MongoDB
        if (ProductMongo) {
          await ProductMongo.updateOne(
            { productId: product.id },
            { stock: calculatedStock, updatedAt: new Date() }
          );
        }
        
        console.log(`   ✅ Stock corrigé: ${calculatedStock}`);
      } else {
        console.log(`   ✅ Stock déjà cohérent`);
      }
      
    } else if (fixMode === 'reset') {
      // Mode reset: remettre à 0
      console.log(`   🔄 Remise à zéro du stock`);
      
      await product.update({ stock: 0 });
      
      if (ProductMongo) {
        await ProductMongo.updateOne(
          { productId: product.id },
          { stock: 0, updatedAt: new Date() }
        );
      }
      
      console.log(`   ✅ Stock remis à zéro`);
    }
  }
};

/**
 * 🚀 Fonction principale
 */
const main = async () => {
  try {
    const diagnostic = await diagnoseNegativeStocks();
    
    if (diagnostic.negativeStocksPG.length > 0) {
      console.log('\n❓ VOULEZ-VOUS CORRIGER LES STOCKS NÉGATIFS?');
      console.log('Options:');
      console.log('1. recalculate - Recalculer basé sur l\'historique');
      console.log('2. reset - Remettre tous les stocks négatifs à 0');
      console.log('3. skip - Ne rien faire');
      
      // Pour le script automatique, utilisons 'recalculate'
      const fixMode = 'recalculate';
      console.log(`\n🔧 Mode choisi: ${fixMode}`);
      
      await fixNegativeStocks(diagnostic.negativeStocksPG, fixMode);
    }
    
    console.log('\n🎉 DIAGNOSTIC ET CORRECTION TERMINÉS !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    // Fermer les connexions
    try {
      await sequelize.close();
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('❌ Erreur fermeture connexions:', closeError);
    }
    process.exit(0);
  }
};

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { diagnoseNegativeStocks, fixNegativeStocks }; 