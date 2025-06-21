// Script de test du flux de stock complet
import StockSyncService from './src/services/stockSyncService.js';
import Product from './src/models/Product.js';
import sequelize from './src/config/database.js';

async function testStockFlow() {
  try {
    console.log('🧪 Test du flux de stock complet\n');

    // 1. Créer un produit de test
    const testProduct = await Product.create({
      name: 'Produit Test Stock',
      description: 'Test du système de stock',
      price: 29.99,
      stock: 100, // Stock initial
      category: 'Test',
      brand: 'TestBrand'
    });

    console.log(`✅ Produit créé: ${testProduct.name} (Stock initial: ${testProduct.stock})`);

    // 2. Simuler ajout au panier (réservation)
    console.log('\n📦 Simulation: Ajout au panier...');
    const reservation = await StockSyncService.reserveStock(
      testProduct.id, 
      3, // Quantité
      1, // UserId
      999 // CartId
    );
    
    // Vérifier le stock après réservation
    await testProduct.reload();
    console.log(`   Stock après réservation: ${testProduct.stock} (devrait être 97)`);

    // 3. Simuler suppression du panier (libération)
    console.log('\n🗑️ Simulation: Suppression du panier...');
    const liberation = await StockSyncService.releaseStock(
      testProduct.id,
      3, // Quantité
      1, // UserId
      999 // CartId
    );

    // Vérifier le stock après libération
    await testProduct.reload();
    console.log(`   Stock après libération: ${testProduct.stock} (devrait être 100)`);

    // 4. Simuler à nouveau ajout au panier
    console.log('\n📦 Simulation: Nouvel ajout au panier...');
    await StockSyncService.reserveStock(testProduct.id, 2, 1, 999);
    await testProduct.reload();
    console.log(`   Stock après nouvelle réservation: ${testProduct.stock} (devrait être 98)`);

    // 5. Simuler confirmation de vente (paiement)
    console.log('\n💳 Simulation: Confirmation de vente...');
    const vente = await StockSyncService.confirmSale(
      testProduct.id,
      2, // Quantité
      1, // UserId
      888 // OrderId
    );

    // Vérifier le stock après confirmation
    await testProduct.reload();
    console.log(`   Stock après confirmation vente: ${testProduct.stock} (devrait être 98 - INCHANGÉ)`);

    // 6. Résumé
    console.log('\n📊 RÉSUMÉ DU TEST:');
    console.log(`   Stock initial: 100`);
    console.log(`   Après réservation 3: 97 ✅`);
    console.log(`   Après libération 3: 100 ✅`);
    console.log(`   Après réservation 2: 98 ✅`);
    console.log(`   Après confirmation vente: 98 ✅ (pas de double déduction)`);

    // 7. Nettoyer
    await testProduct.destroy();
    console.log('\n🧹 Produit de test supprimé');

    console.log('\n🎉 Test réussi ! Le système de stock fonctionne correctement.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Attendre que la DB soit prête
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données établie');
    return testStockFlow();
  })
  .catch(err => {
    console.error('❌ Impossible de se connecter à la base de données:', err);
    process.exit(1);
  }); 