/**
 * 🔍 VÉRIFICATION SPÉCIFIQUE - Produit Ezaeaz
 * Script pour analyser le problème de stock négatif du produit Ezaeaz
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
    return { ProductMongo };
  } catch (error) {
    console.error('❌ Erreur import MongoDB:', error);
    return { ProductMongo: null };
  }
};

/**
 * 🔍 Analyse spécifique du produit Ezaeaz
 */
const analyzeEzaeazStock = async () => {
  console.log('🔍 ANALYSE PRODUIT EZAEAZ');
  console.log('=========================');
  
  try {
    // Connexions
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connecté');
    
    let ProductMongo = null;
    try {
      await connectMongo();
      const models = await getMongoModels();
      ProductMongo = models.ProductMongo;
    } catch (mongoError) {
      console.warn('⚠️ MongoDB non disponible:', mongoError.message);
    }
    
    // 1. Trouver le produit Ezaeaz
    console.log('\n🔍 Recherche du produit Ezaeaz...');
    const ezaeazProduct = await Product.findOne({
      where: {
        name: {
          [sequelize.Sequelize.Op.iLike]: '%ezaeaz%'
        }
      }
    });
    
    if (!ezaeazProduct) {
      console.log('❌ Produit Ezaeaz non trouvé dans PostgreSQL');
      return;
    }
    
    console.log(`✅ Produit trouvé:`);
    console.log(`   ID: ${ezaeazProduct.id}`);
    console.log(`   Nom: ${ezaeazProduct.name}`);
    console.log(`   Stock actuel: ${ezaeazProduct.stock} unités`);
    console.log(`   Prix: ${ezaeazProduct.price / 100}€`);
    console.log(`   Catégorie: ${ezaeazProduct.category}`);
    
    // 2. Vérifier dans MongoDB
    if (ProductMongo) {
      console.log('\n📊 Vérification MongoDB...');
      const mongoProduct = await ProductMongo.findOne({ productId: ezaeazProduct.id });
      
      if (mongoProduct) {
        console.log(`✅ Produit trouvé dans MongoDB:`);
        console.log(`   Stock MongoDB: ${mongoProduct.stock} unités`);
        
        if (ezaeazProduct.stock !== mongoProduct.stock) {
          console.log(`⚠️ DÉSYNCHRONISATION détectée !`);
          console.log(`   PostgreSQL: ${ezaeazProduct.stock}`);
          console.log(`   MongoDB: ${mongoProduct.stock}`);
        } else {
          console.log(`✅ Stocks synchronisés entre les deux bases`);
        }
      } else {
        console.log(`❌ Produit non trouvé dans MongoDB`);
      }
    }
    
    // 3. Analyser l'historique complet
    console.log('\n📋 HISTORIQUE COMPLET DES MOUVEMENTS:');
    const allMovements = await StockHistory.findAll({
      where: { productId: ezaeazProduct.id },
      order: [['createdAt', 'ASC']]
    });
    
    console.log(`📈 Total mouvements: ${allMovements.length}`);
    
    if (allMovements.length === 0) {
      console.log('❌ Aucun mouvement trouvé !');
      return;
    }
    
    // Analyser chaque mouvement
    let stockCalcule = 0;
    let erreurDetectee = false;
    
    console.log('\n📊 DÉTAIL DES MOUVEMENTS:');
    allMovements.forEach((mov, index) => {
      const attendu = stockCalcule + mov.quantityChange;
      const coherent = mov.quantityAfter === attendu;
      
      if (!coherent && !erreurDetectee) {
        erreurDetectee = true;
        console.log(`\n❌ ERREUR DÉTECTÉE AU MOUVEMENT ${index + 1}:`);
      }
      
      console.log(`${index + 1}. ${mov.createdAt.toISOString().split('T')[0]} | ${mov.movementType.toUpperCase()}`);
      console.log(`    Avant: ${mov.quantityBefore} | Change: ${mov.quantityChange > 0 ? '+' : ''}${mov.quantityChange} | Après: ${mov.quantityAfter}`);
      console.log(`    Attendu: ${attendu} | Cohérent: ${coherent ? '✅' : '❌'}`);
      console.log(`    Reason: ${mov.reason || 'N/A'}`);
      console.log(`    Reference: ${mov.reference || 'N/A'}`);
      
      if (!coherent) {
        console.log(`    🚨 PROBLÈME: ${mov.quantityBefore} + ${mov.quantityChange} = ${attendu}, mais quantityAfter = ${mov.quantityAfter}`);
      }
      
      stockCalcule = mov.quantityAfter;
      console.log('');
    });
    
    // 4. Récapitulatif
    const stockFinal = allMovements[allMovements.length - 1].quantityAfter;
    console.log('📊 RÉCAPITULATIF:');
    console.log(`   Stock selon dernier mouvement: ${stockFinal}`);
    console.log(`   Stock réel du produit: ${ezaeazProduct.stock}`);
    console.log(`   Cohérence: ${stockFinal === ezaeazProduct.stock ? '✅' : '❌'}`);
    
    if (stockFinal !== ezaeazProduct.stock) {
      console.log(`\n🔧 CORRECTION NÉCESSAIRE:`);
      console.log(`   Le stock du produit (${ezaeazProduct.stock}) ne correspond pas au dernier mouvement (${stockFinal})`);
    }
    
    // 5. Proposer des solutions
    if (ezaeazProduct.stock < 0) {
      console.log('\n💡 SOLUTIONS PROPOSÉES:');
      console.log('1. Recalculer le stock basé sur l\'historique');
      console.log('2. Ajouter un mouvement d\'ajustement pour corriger');
      console.log('3. Remettre le stock à une valeur positive');
      
      // Calculer le stock théorique
      let stockTheorique = 0;
      const stockInitial = allMovements.find(m => m.movementType === 'initial');
      
      if (stockInitial) {
        stockTheorique = stockInitial.quantityAfter;
        const postInitialMovements = allMovements.filter(m => m.id > stockInitial.id);
        for (const mov of postInitialMovements) {
          stockTheorique += mov.quantityChange;
        }
      } else {
        for (const mov of allMovements) {
          stockTheorique += mov.quantityChange;
        }
      }
      
      console.log(`\n📊 Stock théorique recalculé: ${stockTheorique}`);
      
      if (stockTheorique !== ezaeazProduct.stock) {
        console.log(`🔧 Correction recommandée: ${ezaeazProduct.stock} → ${stockTheorique}`);
      }
    }
    
    return {
      product: ezaeazProduct,
      movements: allMovements,
      coherent: stockFinal === ezaeazProduct.stock
    };
    
  } catch (error) {
    console.error('❌ Erreur analyse:', error);
    throw error;
  }
};

/**
 * 🚀 Fonction principale
 */
const main = async () => {
  try {
    await analyzeEzaeazStock();
    console.log('\n🎉 ANALYSE TERMINÉE !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    // Fermer les connexions
    try {
      await sequelize.close();
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    } catch (closeError) {
      console.error('❌ Erreur fermeture connexions:', closeError);
    }
    process.exit(0);
  }
};

// Exécuter
main(); 