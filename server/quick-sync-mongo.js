#!/usr/bin/env node

import sequelize from './src/config/database.js';
import mongoose from 'mongoose';
import StockHistory from './src/models/StockHistory.js';
import Product from './src/models/Product.js';

// Configuration MongoDB simplifiée
const connectMongo = async () => {
  try {
    // Essayer différentes configurations MongoDB
    const mongoUris = [
      'mongodb://localhost:27017/ecommerce',
      'mongodb://mongo:27017/ecommerce',
      process.env.MONGO_URI
    ].filter(Boolean);

    for (const uri of mongoUris) {
      try {
        await mongoose.connect(uri);
        console.log(`✅ MongoDB connecté: ${uri}`);
        return;
      } catch (err) {
        console.log(`❌ Échec connexion MongoDB: ${uri}`);
      }
    }
    throw new Error('Impossible de se connecter à MongoDB');
  } catch (error) {
    throw error;
  }
};

// Schema MongoDB simple
const StockHistorySchema = new mongoose.Schema({
  stockHistoryId: { type: Number, required: true },
  productId: { type: Number, required: true, index: true },
  userId: { type: Number },
  movementType: { 
    type: String, 
    required: true,
    enum: ['purchase', 'sale', 'adjustment', 'return', 'reservation', 'release', 'damage', 'theft', 'transfer', 'initial'],
    index: true
  },
  quantityBefore: { type: Number, required: true },
  quantityChange: { type: Number, required: true },
  quantityAfter: { type: Number, required: true },
  reason: { type: String },
  reference: { type: String },
  cost: { type: Number },
  totalValue: { type: Number },
  notes: { type: String },
  metadata: {
    productName: { type: String },
    productCategory: { type: String }
  },
  dateInfo: {
    year: { type: Number, index: true },
    month: { type: Number, index: true },
    day: { type: Number, index: true },
    hour: { type: Number },
    weekday: { type: Number }
  }
}, {
  timestamps: true,
  collection: 'stockHistory'
});

// Index optimisés
StockHistorySchema.index({ productId: 1, createdAt: 1 });
StockHistorySchema.index({ 'dateInfo.year': 1, 'dateInfo.month': 1, 'dateInfo.day': 1 });

const StockHistoryMongo = mongoose.model('StockHistory', StockHistorySchema);

/**
 * 🚀 Synchronisation Rapide PostgreSQL → MongoDB
 */
const quickSync = async () => {
  console.log('🚀 SYNCHRONISATION RAPIDE PostgreSQL → MongoDB');
  console.log('================================================');
  
  try {
    // Connexions
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connecté');
    
    await connectMongo();
    
    // Nettoyage MongoDB
    console.log('🧹 Nettoyage MongoDB...');
    await StockHistoryMongo.deleteMany({});
    
    // Récupération données PostgreSQL
    console.log('📊 Récupération des données PostgreSQL...');
    const stockHistories = await StockHistory.findAll({
      include: [{
        model: Product,
        attributes: ['name', 'category']
      }],
      order: [['createdAt', 'ASC']],
      limit: 1000 // Limiter pour les tests
    });
    
    console.log(`📈 ${stockHistories.length} mouvements trouvés`);
    
    if (stockHistories.length === 0) {
      console.log('⚠️ Aucune donnée de stock trouvée dans PostgreSQL');
      console.log('💡 Assurez-vous d\'avoir des données de stock dans votre base PostgreSQL');
      return;
    }
    
    // Transformation et insertion
    console.log('💾 Transformation et insertion...');
    const mongoDocuments = stockHistories.map(stock => {
      const createdAt = new Date(stock.createdAt);
      
      return {
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
        
        metadata: {
          productName: stock.Product?.name || `Produit ${stock.productId}`,
          productCategory: stock.Product?.category || 'Non catégorisé'
        },
        
        dateInfo: {
          year: createdAt.getFullYear(),
          month: createdAt.getMonth() + 1,
          day: createdAt.getDate(),
          hour: createdAt.getHours(),
          weekday: createdAt.getDay()
        },
        
        createdAt: stock.createdAt,
        updatedAt: stock.updatedAt
      };
    });
    
    // Insertion par lots
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < mongoDocuments.length; i += batchSize) {
      const batch = mongoDocuments.slice(i, i + batchSize);
      await StockHistoryMongo.insertMany(batch);
      inserted += batch.length;
      console.log(`📝 ${inserted}/${mongoDocuments.length} mouvements synchronisés`);
    }
    
    // Vérification finale
    const mongoCount = await StockHistoryMongo.countDocuments();
    
    console.log('\n🎉 SYNCHRONISATION TERMINÉE !');
    console.log('================================');
    console.log(`✅ ${mongoCount} documents dans MongoDB`);
    console.log('🔥 Vous pouvez maintenant utiliser les routes MongoDB :');
    console.log('   • GET /api/stock/mongo/evolution/chart');
    console.log('   • GET /api/stock/mongo/movements/stats');
    console.log('   • GET /api/stock/mongo/status');
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    console.log('\n🔧 Solutions possibles :');
    console.log('1. Vérifiez que MongoDB est démarré (docker-compose up)');
    console.log('2. Vérifiez que PostgreSQL contient des données de stock');
    console.log('3. Vérifiez les variables d\'environnement de connexion');
  } finally {
    await sequelize.close();
    await mongoose.disconnect();
    console.log('🔌 Connexions fermées');
  }
};

/**
 * Test rapide de MongoDB
 */
const testMongo = async () => {
  try {
    console.log('🧪 Test de MongoDB...');
    await connectMongo();
    
    const count = await StockHistoryMongo.countDocuments();
    console.log(`📊 ${count} documents dans MongoDB`);
    
    if (count > 0) {
      const sample = await StockHistoryMongo.findOne();
      console.log('📄 Exemple de document:', {
        productId: sample.productId,
        movementType: sample.movementType,
        quantityAfter: sample.quantityAfter,
        productName: sample.metadata?.productName
      });
    }
    
  } catch (error) {
    console.error('❌ Test MongoDB échoué:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Exécution
const command = process.argv[2];

if (command === 'test') {
  testMongo();
} else {
  quickSync();
} 