import OrderMongo from './src/models/OrderMongo.js';
import mongoose from 'mongoose';

const addRevenueData = async () => {
  try {
    console.log('💰 Ajout rapide de données de CA pour le graphique...');
    
    // Connexion MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/challenge');
    }

    // Supprimer les anciennes données de test
    await OrderMongo.deleteMany({ userId: 'quick-test' });

    // Créer des commandes étalées sur les 30 derniers jours
    const orders = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(now.getTime() - (i * 2 * 24 * 60 * 60 * 1000)); // Tous les 2 jours
      
      orders.push({
        userId: 'quick-test',
        status: 'Completed',
        totalAmount: Math.floor(Math.random() * 500) + 50, // Entre 50€ et 550€
        items: [
          { 
            productId: `prod-${i}`, 
            quantity: Math.floor(Math.random() * 3) + 1, 
            price: Math.floor(Math.random() * 200) + 25 
          }
        ],
        shippingAddress: {
          street: `${i} Test Street`,
          city: 'Test City',
          postalCode: '12345',
          country: 'France'
        },
        createdAt: date,
        updatedAt: date
      });
    }

    // Insérer les commandes
    await OrderMongo.insertMany(orders);
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    console.log(`✅ ${orders.length} commandes créées`);
    console.log(`💰 CA total généré: ${totalRevenue.toFixed(2)}€`);
    console.log('🎯 Le graphique devrait maintenant fonctionner !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  process.exit(0);
};

addRevenueData(); 