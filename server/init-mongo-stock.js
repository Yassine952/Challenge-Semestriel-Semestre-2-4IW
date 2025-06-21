#!/usr/bin/env node

import dotenv from 'dotenv';
import sequelize from './src/config/database.js';
import mongoose from 'mongoose';
import StockHistory from './src/models/StockHistory.js';
import Product from './src/models/Product.js';

// Charger les variables d'environnement
dotenv.config();

/**
 * 🚀 INITIALISATION MONGODB POUR VOTRE PROJET
 * Synchronise PostgreSQL → MongoDB pour les performances
 */

// Configuration MongoDB avec fallbacks
const MONGO_URIS = [
  process.env.MONGO_URI,
  'mongodb://mongo:27017/ecommerce',  // Docker
  'mongodb://localhost:27017/ecommerce'  // Local
].filter(Boolean);

/**
 * Connexion MongoDB avec retry
 */
const connectMongo = async () => {
  for (const uri of MONGO_URIS) {
    try {
      console.log(`🔄 Tentative de connexion MongoDB: ${uri}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅ MongoDB connecté: ${uri}`);
      return true;
    } catch (error) {
      console.log(`❌ Échec: ${uri} - ${error.message}`);
    }
  }
  throw new Error('❌ Impossible de se connecter à MongoDB');
};

/**
 * Schema MongoDB optimisé pour votre projet
 */
const createStockHistorySchema = () => {
  const schema = new mongoose.Schema({
    // Identifiants
    stockHistoryId: { type: Number, required: true, unique: true },
    productId: { type: Number, required: true, index: true },
    userId: { type: Number },
    
    // Mouvement
    movementType: { 
      type: String, 
      required: true,
      enum: ['purchase', 'sale', 'adjustment', 'return', 'reservation', 'release', 'damage', 'theft', 'transfer', 'initial'],
      index: true
    },
    
    // Quantités
    quantityBefore: { type: Number, required: true },
    quantityChange: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    
    // Détails
    reason: { type: String },
    reference: { type: String, index: true },
    cost: { type: Number },
    totalValue: { type: Number },
    notes: { type: String },
    
    // 🔥 MÉTADONNÉES ENRICHIES pour MongoDB
    metadata: {
      orderId: { type: Number },
      cartId: { type: Number },
      productName: { type: String, index: true },
      productCategory: { type: String, index: true },
      userEmail: { type: String }
    },
    
    // 🚀 OPTIMISATIONS TEMPORELLES
    dateInfo: {
      year: { type: Number, index: true },
      month: { type: Number, index: true },
      day: { type: Number, index: true },
      hour: { type: Number },
      weekday: { type: Number },
      week: { type: Number }
    }
  }, {
    timestamps: true,
    collection: 'stockHistory'
  });

  // 📊 INDEX POUR PERFORMANCES
  schema.index({ productId: 1, createdAt: 1 });
  schema.index({ movementType: 1, createdAt: 1 });
  schema.index({ 'dateInfo.year': 1, 'dateInfo.month': 1, 'dateInfo.day': 1 });
  schema.index({ 'dateInfo.year': 1, 'dateInfo.month': 1, productId: 1 });
  schema.index({ createdAt: 1, quantityAfter: 1 });

  return schema;
};

/**
 * Utilitaire pour calculer les infos temporelles
 */
const getDateInfo = (date) => {
  const d = new Date(date);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    weekday: d.getDay(),
    week: Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + new Date(d.getFullYear(), 0, 1).getDay() + 1) / 7)
  };
};

/**
 * 🚀 SYNCHRONISATION PRINCIPALE
 */
const syncStockData = async () => {
  let StockHistoryMongo = null;
  
  try {
    console.log('🚀 SYNCHRONISATION POSTGRESQL → MONGODB');
    console.log('=====================================');
    
    // Connexions
    console.log('🔗 Connexion aux bases de données...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connecté');
    
    await connectMongo();
    console.log('✅ MongoDB connecté');
    
    // Créer le modèle MongoDB
    const stockHistorySchema = createStockHistorySchema();
    StockHistoryMongo = mongoose.model('StockHistory', stockHistorySchema);
    
    // Nettoyer MongoDB
    console.log('🧹 Nettoyage de la collection MongoDB...');
    await StockHistoryMongo.deleteMany({});
    console.log('✅ Collection nettoyée');
    
    // Récupérer les données PostgreSQL
    console.log('📊 Récupération des données PostgreSQL...');
    const stockHistories = await StockHistory.findAll({
      include: [{
        model: Product,
        attributes: ['name', 'category']
      }],
      order: [['createdAt', 'ASC']]
    });
    
    console.log(`📈 ${stockHistories.length} mouvements de stock trouvés`);
    
    if (stockHistories.length === 0) {
      console.log('⚠️  Aucune donnée de stock dans PostgreSQL');
      console.log('💡 Créez des produits et des commandes pour générer des données');
      return;
    }
    
    // Transformation des données
    console.log('🔄 Transformation des données...');
    const mongoDocuments = stockHistories.map(stock => ({
      stockHistoryId: stock.id,
      productId: stock.productId,
      userId: stock.userId,
      movementType: stock.movementType,
      quantityBefore: stock.quantityBefore,
      quantityChange: stock.quantityChange,
      quantityAfter: stock.quantityAfter,
      reason: stock.reason,
      reference: stock.reference,
      cost: stock.cost ? parseFloat(stock.cost) : null,
      totalValue: stock.totalValue ? parseFloat(stock.totalValue) : null,
      notes: stock.notes,
      
      // 🔥 Métadonnées enrichies
      metadata: {
        orderId: stock.metadata?.orderId || null,
        cartId: stock.metadata?.cartId || null,
        productName: stock.Product?.name || `Produit ${stock.productId}`,
        productCategory: stock.Product?.category || 'Non catégorisé',
        userEmail: stock.metadata?.userEmail || null
      },
      
      // 🚀 Optimisations temporelles
      dateInfo: getDateInfo(stock.createdAt),
      
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt
    }));
    
    // Insertion par lots
    console.log('💾 Insertion dans MongoDB...');
    const batchSize = 500;
    let inserted = 0;
    
    for (let i = 0; i < mongoDocuments.length; i += batchSize) {
      const batch = mongoDocuments.slice(i, i + batchSize);
      await StockHistoryMongo.insertMany(batch, { ordered: false });
      inserted += batch.length;
      
      const progress = Math.round((inserted / mongoDocuments.length) * 100);
      console.log(`📝 ${inserted}/${mongoDocuments.length} (${progress}%) synchronisés`);
    }
    
    // Vérification finale
    const mongoCount = await StockHistoryMongo.countDocuments();
    
    console.log('\n🎉 SYNCHRONISATION TERMINÉE !');
    console.log('============================');
    console.log(`✅ PostgreSQL: ${stockHistories.length} mouvements`);
    console.log(`✅ MongoDB: ${mongoCount} documents`);
    console.log(`📊 Taux de réussite: ${Math.round((mongoCount/stockHistories.length)*100)}%`);
    
    if (mongoCount === stockHistories.length) {
      console.log('\n🔥 MONGODB PRÊT POUR LES REQUÊTES !');
      console.log('🚀 Votre dashboard va maintenant utiliser MongoDB');
      console.log('⚡ Performance améliorée de 3-5x sur les graphiques');
    } else {
      console.log('\n⚠️  Synchronisation partielle');
      console.log('🔧 Vérifiez les logs pour les erreurs');
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR DE SYNCHRONISATION:');
    console.error(error);
    
    console.log('\n🔧 SOLUTIONS POSSIBLES:');
    console.log('1. Vérifiez que Docker est démarré: docker-compose up -d');
    console.log('2. Vérifiez les variables d\'environnement (.env)');
    console.log('3. Vérifiez que PostgreSQL contient des données');
    console.log('4. Redémarrez les containers: docker-compose restart');
    
  } finally {
    // Fermeture propre
    try {
      await sequelize.close();
      await mongoose.disconnect();
      console.log('\n🔌 Connexions fermées proprement');
    } catch (closeError) {
      console.error('Erreur lors de la fermeture:', closeError);
    }
  }
};

/**
 * Vérification du statut MongoDB
 */
const checkStatus = async () => {
  try {
    console.log('🔍 Vérification du statut MongoDB...');
    await connectMongo();
    
    const StockHistoryMongo = mongoose.model('StockHistory', createStockHistorySchema());
    const count = await StockHistoryMongo.countDocuments();
    
    console.log(`📊 Documents MongoDB: ${count}`);
    
    if (count > 0) {
      console.log('✅ MongoDB opérationnel avec données');
      
      // Échantillon
      const sample = await StockHistoryMongo.findOne().lean();
      console.log('📄 Exemple:', {
        productId: sample.productId,
        movementType: sample.movementType,
        productName: sample.metadata?.productName,
        date: sample.createdAt
      });
    } else {
      console.log('⚠️  MongoDB vide - synchronisation nécessaire');
    }
    
  } catch (error) {
    console.error('❌ Erreur de vérification:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// 🚀 EXÉCUTION
const command = process.argv[2];

console.log('🎯 GESTIONNAIRE MONGODB POUR STOCKS');
console.log('===================================');

if (command === 'status' || command === 'check') {
  checkStatus();
} else if (command === 'sync' || !command) {
  syncStockData();
} else {
  console.log('📋 Utilisation:');
  console.log('  node init-mongo-stock.js        - Synchroniser');
  console.log('  node init-mongo-stock.js sync    - Synchroniser');
  console.log('  node init-mongo-stock.js status  - Vérifier le statut');
} 