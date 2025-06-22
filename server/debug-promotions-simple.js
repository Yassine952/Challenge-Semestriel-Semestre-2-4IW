const PromotionMongo = require('./src/models/PromotionMongo.js');
const ProductMongo = require('./src/models/ProductMongo.js');
const mongoose = require('mongoose');

async function debugPromotions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('🔍 DEBUG: Vérification des promotions et produits...');
    
    // 1. Vérifier les promotions actives
    const promotions = await PromotionMongo.find({ isActive: true });
    console.log('\n📋 PROMOTIONS ACTIVES:', promotions.length);
    
    promotions.forEach(promo => {
      console.log(`\n🎫 ${promo.code} (${promo.applicationType}):`);
      console.log('   Description:', promo.description);
      console.log('   Réduction:', `${promo.discountValue}${promo.discountType === 'percentage' ? '%' : '€'}`);
      if (promo.applicationType === 'category') {
        console.log('   Catégories applicables:', promo.applicableCategories);
      }
      if (promo.applicationType === 'product') {
        console.log('   Produits applicables:', promo.applicableProductIds);
      }
    });
    
    // 2. Vérifier les produits
    const products = await ProductMongo.find({});
    console.log('\n📦 PRODUITS:', products.length);
    
    products.forEach(product => {
      console.log(`\n📦 ${product.name}:`);
      console.log('   ID:', product.productId);
      console.log('   Catégorie:', product.category);
      console.log('   Prix:', product.price, 'centimes');
    });
    
    // 3. Simuler la logique de filtrage
    console.log('\n🔍 SIMULATION FILTRAGE:');
    products.forEach(product => {
      console.log(`\n🎯 Pour le produit "${product.name}" (catégorie: "${product.category}"):`);
      
      const applicablePromotions = promotions.filter(promo => {
        if (promo.applicationType === 'all') {
          console.log(`   ✅ ${promo.code} - Applicable (tous produits)`);
          return true;
        } else if (promo.applicationType === 'category') {
          const isApplicable = promo.applicableCategories && promo.applicableCategories.includes(product.category);
          console.log(`   ${isApplicable ? '✅' : '❌'} ${promo.code} - Catégorie "${product.category}" ${isApplicable ? 'trouvée' : 'non trouvée'} dans [${promo.applicableCategories}]`);
          return isApplicable;
        } else if (promo.applicationType === 'product') {
          const isApplicable = promo.applicableProductIds && promo.applicableProductIds.includes(product.productId);
          console.log(`   ${isApplicable ? '✅' : '❌'} ${promo.code} - Produit ID ${product.productId} ${isApplicable ? 'trouvé' : 'non trouvé'} dans [${promo.applicableProductIds}]`);
          return isApplicable;
        }
        return false;
      });
      
      console.log(`   🎫 Promotions applicables: ${applicablePromotions.length}`);
      applicablePromotions.forEach(promo => {
        console.log(`      - ${promo.code}: -${promo.discountValue}${promo.discountType === 'percentage' ? '%' : '€'}`);
      });
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Debug terminé');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

debugPromotions(); 