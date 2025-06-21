const mongoose = require('mongoose');

async function debugPromotions() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://admin:password@localhost:27017/lemondedesmugs?authSource=admin');
    console.log('✅ Connexion MongoDB réussie');

    // Importer les modèles
    const { default: PromotionMongo } = await import('./src/models/PromotionMongo.js');
    const { default: ProductMongo } = await import('./src/models/ProductMongo.js');

    console.log('\n=== ÉTAT DES PROMOTIONS ===');
    
    // Vérifier toutes les promotions
    const allPromotions = await PromotionMongo.find();
    console.log(`📊 Total promotions : ${allPromotions.length}`);
    
    allPromotions.forEach(promo => {
      const now = new Date();
      const start = new Date(promo.startDate);
      const end = new Date(promo.endDate);
      const isActive = promo.isActive && start <= now && end >= now;
      
      console.log(`\n🎫 Promotion: ${promo.code}`);
      console.log(`   Description: ${promo.description}`);
      console.log(`   Type: ${promo.applicationType}`);
      console.log(`   Active: ${promo.isActive}`);
      console.log(`   Dates: ${start.toLocaleDateString()} → ${end.toLocaleDateString()}`);
      console.log(`   Statut: ${isActive ? '✅ ACTIVE' : '❌ INACTIVE'}`);
      
      if (promo.applicationType === 'category') {
        console.log(`   Catégories: ${promo.applicableCategories?.join(', ') || 'Aucune'}`);
      } else if (promo.applicationType === 'product') {
        console.log(`   Produits: ${promo.applicableProductIds?.join(', ') || 'Aucun'}`);
      }
    });

    // Vérifier les promotions actives
    const now = new Date();
    const activePromotions = await PromotionMongo.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    console.log(`\n🟢 Promotions actives : ${activePromotions.length}`);
    
    if (activePromotions.length === 0) {
      console.log('❌ Aucune promotion active trouvée !');
      console.log('💡 Créons une promotion de test...');
      
      // Créer une promotion de test
      const testPromo = await PromotionMongo.create({
        promotionId: 999,
        code: 'TEST50',
        description: 'Promotion test 50%',
        discountType: 'percentage',
        discountValue: 50,
        minOrderAmount: 0,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        applicationType: 'all',
        isActive: true
      });
      
      console.log(`✅ Promotion test créée: ${testPromo.code}`);
    }

    // Vérifier quelques produits
    console.log('\n=== ÉTAT DES PRODUITS ===');
    const products = await ProductMongo.find().limit(3);
    products.forEach(product => {
      console.log(`📦 ${product.name} (ID: ${product.productId})`);
      console.log(`   Catégorie: ${product.category}`);
      console.log(`   Prix: ${product.price} centimes = ${(product.price/100).toFixed(2)}€`);
      console.log(`   En vente: ${product.onSale}`);
    });

    // Test de la logique de recherche avec promotion
    console.log('\n=== TEST LOGIQUE PROMOTION ===');
    const activePromos = await PromotionMongo.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    console.log(`Promotions actives trouvées: ${activePromos.length}`);
    
    const promotionProductIds = [];
    const promotionCategories = [];
    let hasAllPromotion = false;
    
    activePromos.forEach(promo => {
      console.log(`Analyse promotion: ${promo.code} (${promo.applicationType})`);
      
      if (promo.applicationType === 'product' && promo.applicableProductIds) {
        promotionProductIds.push(...promo.applicableProductIds);
        console.log(`  → Produits ajoutés: ${promo.applicableProductIds.join(', ')}`);
      } else if (promo.applicationType === 'category' && promo.applicableCategories) {
        promotionCategories.push(...promo.applicableCategories);
        console.log(`  → Catégories ajoutées: ${promo.applicableCategories.join(', ')}`);
      } else if (promo.applicationType === 'all') {
        hasAllPromotion = true;
        console.log(`  → Promotion sur TOUS les produits`);
      }
    });
    
    console.log(`\nRésumé des conditions:`);
    console.log(`- Produits en promotion: [${promotionProductIds.join(', ')}]`);
    console.log(`- Catégories en promotion: [${promotionCategories.join(', ')}]`);
    console.log(`- Promotion globale: ${hasAllPromotion}`);
    
    // Construire la requête comme dans le code
    if (promotionProductIds.length > 0 || promotionCategories.length > 0 || hasAllPromotion) {
      const promotionQuery = [];
      
      if (hasAllPromotion) {
        console.log('✅ Promotion globale → Tous les produits sont en promotion');
      } else {
        if (promotionProductIds.length > 0) {
          promotionQuery.push({ productId: { $in: promotionProductIds } });
        }
        if (promotionCategories.length > 0) {
          promotionQuery.push({ category: { $in: promotionCategories } });
        }
        
        console.log(`Requête promotion: ${JSON.stringify(promotionQuery, null, 2)}`);
      }
    } else {
      console.log('❌ Aucune condition de promotion → Résultat vide');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
}

debugPromotions(); 