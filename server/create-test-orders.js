import OrderMongo from './src/models/OrderMongo.js';
import mongoose from 'mongoose';

const createTestOrders = async () => {
  try {
    console.log('🛒 Création de commandes de test avec statut "Completed"...\n');
    
    // Connexion MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/challenge');
      console.log('✅ Connexion MongoDB établie');
    }

    // Supprimer les anciennes commandes de test
    await OrderMongo.deleteMany({ userId: 'test-user' });
    console.log('🗑️  Anciennes commandes de test supprimées');

    // Créer des commandes de test avec différents statuts
    const testOrders = [
      {
        userId: 'test-user',
        status: 'Completed',
        totalAmount: 299.99,
        items: [
          { productId: 'prod-1', quantity: 2, price: 149.99 }
        ],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'France'
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        userId: 'test-user',
        status: 'Completed',
        totalAmount: 89.50,
        items: [
          { productId: 'prod-2', quantity: 1, price: 89.50 }
        ],
        shippingAddress: {
          street: '456 Test Avenue',
          city: 'Test City',
          postalCode: '12345',
          country: 'France'
        },
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-12')
      },
      {
        userId: 'test-user',
        status: 'Completed',
        totalAmount: 450.00,
        items: [
          { productId: 'prod-3', quantity: 3, price: 150.00 }
        ],
        shippingAddress: {
          street: '789 Test Boulevard',
          city: 'Test City',
          postalCode: '12345',
          country: 'France'
        },
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-07')
      },
      {
        userId: 'test-user',
        status: 'Pending',
        totalAmount: 125.75,
        items: [
          { productId: 'prod-4', quantity: 1, price: 125.75 }
        ],
        shippingAddress: {
          street: '321 Test Lane',
          city: 'Test City',
          postalCode: '12345',
          country: 'France'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 'test-user',
        status: 'CANCELLED',
        totalAmount: 75.25,
        items: [
          { productId: 'prod-5', quantity: 1, price: 75.25 }
        ],
        shippingAddress: {
          street: '654 Test Road',
          city: 'Test City',
          postalCode: '12345',
          country: 'France'
        },
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-21')
      }
    ];

    // Insérer les commandes
    const insertedOrders = await OrderMongo.insertMany(testOrders);
    console.log(`✅ ${insertedOrders.length} commandes de test créées`);

    // Calculer le CA attendu (seulement les commandes 'Completed')
    const completedOrders = testOrders.filter(order => order.status === 'Completed');
    const expectedRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    console.log('\n📊 RÉSUMÉ:');
    console.log(`  • Commandes créées: ${testOrders.length}`);
    console.log(`  • Commandes terminées: ${completedOrders.length}`);
    console.log(`  • CA attendu: ${expectedRevenue}€`);
    console.log(`  • Commandes en attente: ${testOrders.filter(o => o.status === 'Pending').length}`);
    console.log(`  • Commandes annulées: ${testOrders.filter(o => o.status === 'CANCELLED').length}`);

    // Vérification avec aggregation
    const revenueCheck = await OrderMongo.aggregate([
      {
        $match: { status: 'Completed' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (revenueCheck.length > 0) {
      console.log(`\n✅ Vérification: ${revenueCheck[0].count} commandes = ${revenueCheck[0].total}€`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  console.log('\n🎯 Vous pouvez maintenant actualiser le dashboard comptabilité !');
  process.exit(0);
};

createTestOrders(); 