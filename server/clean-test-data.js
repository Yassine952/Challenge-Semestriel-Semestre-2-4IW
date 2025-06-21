import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configuration des variables d'environnement
dotenv.config();

// Configuration PostgreSQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false,
});

// Modèles simplifiés
const Product = sequelize.define('Product', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: Sequelize.STRING, allowNull: false },
  stock: { type: Sequelize.INTEGER, defaultValue: 0 },
}, { tableName: 'Products', timestamps: true });

const StockHistory = sequelize.define('StockHistory', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: Sequelize.INTEGER, allowNull: false },
  movementType: { type: Sequelize.STRING, allowNull: false },
  quantityBefore: { type: Sequelize.INTEGER, allowNull: false },
  quantityChange: { type: Sequelize.INTEGER, allowNull: false },
  quantityAfter: { type: Sequelize.INTEGER, allowNull: false },
  reason: { type: Sequelize.STRING },
}, { tableName: 'StockHistories', timestamps: true });

const cleanTestDataAndInitialize = async () => {
  try {
    console.log('🧹 Démarrage du nettoyage des données de test...');

    // Connexion à PostgreSQL
    console.log('📡 Connexion à PostgreSQL...');
    await sequelize.authenticate();

    // 1. Supprimer toutes les données de test dans StockHistory
    console.log('\n🗑️ Suppression des données de test dans StockHistory...');
    const deletedHistoryCount = await StockHistory.destroy({ where: {} });
    console.log(`✅ ${deletedHistoryCount} entrées d'historique supprimées`);

    // 2. Récupérer tous les produits
    console.log('\n📦 Récupération des produits existants...');
    const products = await Product.findAll();
    console.log(`📊 ${products.length} produits trouvés`);

    // 3. Créer un historique initial pour chaque produit avec son stock actuel
    console.log('\n📝 Création de l\'historique initial...');
    let initializedCount = 0;
    
    for (const product of products) {
      if (product.stock > 0) {
        await StockHistory.create({
          productId: product.id,
          movementType: 'initial',
          quantityBefore: 0,
          quantityChange: product.stock,
          quantityAfter: product.stock,
          reason: 'Stock initial lors du nettoyage des données de test'
        });
        
        console.log(`✅ ${product.name}: Stock initial de ${product.stock} unités enregistré`);
        initializedCount++;
      } else {
        console.log(`⚠️ ${product.name}: Stock à 0, pas d'historique créé`);
      }
    }

    // 4. Afficher le résumé
    console.log('\n📋 RÉSUMÉ DU NETTOYAGE:');
    console.log(`🗑️ Données de test supprimées: ${deletedHistoryCount} entrées`);
    console.log(`📝 Produits initialisés: ${initializedCount} sur ${products.length}`);
    
    // 5. Vérification finale - calculer le stock total réel
    const totalRealStock = await Product.sum('stock');
    console.log(`📊 Stock total réel: ${totalRealStock || 0} unités`);

    // 6. Afficher quelques exemples de produits
    console.log('\n🔍 Exemples de produits:');
    const sampleProducts = await Product.findAll({ limit: 5 });
    for (const product of sampleProducts) {
      console.log(`   • ${product.name}: ${product.stock} unités en stock`);
    }

    console.log('\n🎉 Nettoyage terminé avec succès !');
    console.log('📊 Votre dashboard affichera maintenant les vraies données de stock.');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    // Fermer la connexion
    await sequelize.close();
    console.log('📡 Connexion fermée');
  }
};

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanTestDataAndInitialize();
}

export default cleanTestDataAndInitialize; 