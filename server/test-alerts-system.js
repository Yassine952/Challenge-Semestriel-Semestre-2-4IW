import { connectDB } from './src/config/database.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import AlertHistory from './src/models/AlertHistory.js';
import { sendNewProductAlert } from './src/controllers/alertController.js';

const testAlertsSystem = async () => {
  try {
    console.log('🔍 Test du système d\'alertes...\n');

    // 1. Vérifier les utilisateurs avec alertes activées
    console.log('1️⃣ Utilisateurs avec alertes nouveaux produits activées:');
    const usersWithAlerts = await User.findAll({
      where: { 
        role: 'ROLE_USER',
        alertNewProducts: true
      },
      attributes: ['id', 'email', 'firstName', 'lastName', 'alertNewProducts', 'alertCategories']
    });

    if (usersWithAlerts.length === 0) {
      console.log('❌ Aucun utilisateur n\'a activé les alertes nouveaux produits');
      console.log('\n💡 Solution: Activez les alertes dans les préférences utilisateur');
    } else {
      usersWithAlerts.forEach(user => {
        console.log(`✅ ${user.email} - Catégories: ${JSON.stringify(user.alertCategories) || 'Toutes'}`);
      });
    }

    // 2. Vérifier les produits récents en vente
    console.log('\n2️⃣ Produits récents en vente:');
    const recentProducts = await Product.findAll({
      where: {
        onSale: true,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
        }
      },
      attributes: ['id', 'name', 'category', 'onSale', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    if (recentProducts.length === 0) {
      console.log('❌ Aucun produit en vente créé dans les dernières 24h');
    } else {
      recentProducts.forEach(product => {
        console.log(`✅ ${product.name} (${product.category}) - Créé: ${product.createdAt}`);
      });
    }

    // 3. Vérifier l'historique des alertes récentes
    console.log('\n3️⃣ Historique des alertes récentes:');
    const recentAlerts = await AlertHistory.findAll({
      where: {
        alertType: 'new_product',
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
        }
      },
      include: [
        { model: User, attributes: ['email'] },
        { model: Product, attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    if (recentAlerts.length === 0) {
      console.log('❌ Aucune alerte nouveau produit dans les dernières 24h');
    } else {
      recentAlerts.forEach(alert => {
        console.log(`✅ ${alert.User?.email} - ${alert.Product?.name} - ${alert.createdAt}`);
      });
    }

    // 4. Test manuel d'une alerte
    if (usersWithAlerts.length > 0 && recentProducts.length > 0) {
      console.log('\n4️⃣ Test manuel d\'alerte:');
      const testProduct = recentProducts[0];
      console.log(`📤 Envoi d'alerte de test pour: ${testProduct.name}`);
      
      try {
        await sendNewProductAlert(testProduct);
        console.log('✅ Alerte envoyée avec succès');
      } catch (error) {
        console.log('❌ Erreur lors de l\'envoi:', error.message);
      }
    }

    // 5. Activer les alertes pour l'utilisateur test si nécessaire
    console.log('\n5️⃣ Configuration utilisateur test:');
    const testUser = await User.findOne({ where: { email: 'kayyzen@gmail.com' } });
    
    if (testUser) {
      console.log(`👤 Utilisateur trouvé: ${testUser.email}`);
      console.log(`   - Alertes nouveaux produits: ${testUser.alertNewProducts}`);
      console.log(`   - Catégories: ${JSON.stringify(testUser.alertCategories) || 'Toutes'}`);
      
      if (!testUser.alertNewProducts) {
        console.log('🔧 Activation des alertes nouveaux produits...');
        await testUser.update({ 
          alertNewProducts: true,
          alertCategories: [] // Toutes les catégories
        });
        console.log('✅ Alertes activées pour l\'utilisateur test');
      }
    } else {
      console.log('❌ Utilisateur test non trouvé');
    }

    console.log('\n🎯 Résumé:');
    console.log(`- Utilisateurs avec alertes: ${usersWithAlerts.length}`);
    console.log(`- Produits récents en vente: ${recentProducts.length}`);
    console.log(`- Alertes récentes: ${recentAlerts.length}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
};

// Import Op pour les requêtes Sequelize
import { Op } from 'sequelize';

// Démarrer le test
connectDB().then(() => {
  testAlertsSystem();
}).catch(error => {
  console.error('Erreur de connexion à la base de données:', error);
  process.exit(1);
}); 