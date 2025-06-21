import Order from './src/models/Order.js';
import OrderMongo from './src/models/OrderMongo.js';
import { Op } from 'sequelize';
import mongoose from 'mongoose';

const debugCA = async () => {
  try {
    console.log('=== 🔍 DIAGNOSTIC CHIFFRE D\'AFFAIRES ===\n');
    
    // ========== POSTGRESQL ==========
    console.log('📊 DONNÉES POSTGRESQL:');
    
    // Toutes les commandes PostgreSQL
    const allOrdersSQL = await Order.findAll({
      attributes: ['id', 'status', 'totalAmount', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    console.log(`  Total commandes: ${allOrdersSQL.length}`);
    console.log('  Dernières 5 commandes:');
    allOrdersSQL.forEach(order => {
      console.log(`    #${order.id}: ${order.status} - ${order.totalAmount}€ (${order.createdAt})`);
    });
    
    // Statistiques par statut PostgreSQL
    const statsSQL = await Order.findAll({
      attributes: [
        'status',
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('totalAmount')), 'total']
      ],
      group: ['status']
    });
    
    console.log('\n  Répartition par statut PostgreSQL:');
    statsSQL.forEach(stat => {
      console.log(`    ${stat.status}: ${stat.dataValues.count} commandes = ${stat.dataValues.total || 0}€`);
    });
    
    // CA total PostgreSQL avec différents statuts
    const caCurrentSQL = await Order.sum('totalAmount', {
      where: {
        status: {
          [Op.in]: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'Pending']
        }
      }
    });
    
    const caAllSQL = await Order.sum('totalAmount');
    
    console.log(`\n  💰 CA PostgreSQL (statuts actifs): ${caCurrentSQL || 0}€`);
    console.log(`  💰 CA PostgreSQL (tous statuts): ${caAllSQL || 0}€`);
    
    // ========== MONGODB ==========
    console.log('\n\n📊 DONNÉES MONGODB:');
    
    // Connexion MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/challenge');
    }
    
    // Toutes les commandes MongoDB
    const allOrdersMongo = await OrderMongo.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    const totalOrdersMongo = await OrderMongo.countDocuments();
    
    console.log(`  Total commandes: ${totalOrdersMongo}`);
    console.log('  Dernières 5 commandes:');
    allOrdersMongo.forEach(order => {
      console.log(`    #${order._id}: ${order.status} - ${order.totalAmount}€ (${order.createdAt})`);
    });
    
    // Statistiques par statut MongoDB
    const statsMongo = await OrderMongo.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    console.log('\n  Répartition par statut MongoDB:');
    statsMongo.forEach(stat => {
      console.log(`    ${stat._id}: ${stat.count} commandes = ${stat.total || 0}€`);
    });
    
    // CA total MongoDB
    const caActiveMongo = await OrderMongo.aggregate([
      {
        $match: {
          status: { $in: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'Pending'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const caAllMongo = await OrderMongo.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    console.log(`\n  💰 CA MongoDB (statuts actifs): ${caActiveMongo[0]?.total || 0}€`);
    console.log(`  💰 CA MongoDB (tous statuts): ${caAllMongo[0]?.total || 0}€`);
    
    // ========== RECOMMANDATIONS ==========
    console.log('\n\n🎯 RECOMMANDATIONS:');
    
    if (totalOrdersMongo > allOrdersSQL.length) {
      console.log('  ✅ Les données principales sont dans MongoDB');
      console.log('  ➡️  Le contrôleur comptabilité devrait utiliser OrderMongo au lieu de Order');
    } else if (allOrdersSQL.length > 0) {
      console.log('  ✅ Les données principales sont dans PostgreSQL');
      console.log('  ➡️  Vérifier les statuts des commandes dans le contrôleur');
    } else {
      console.log('  ❌ Aucune donnée trouvée dans les deux bases');
      console.log('  ➡️  Créer des données de test');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  console.log('\n=== FIN DU DIAGNOSTIC ===');
  process.exit(0);
};

debugCA(); 