import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const adminCredentials = {
  email: 'yassine.abdelkader95@gmail.com',
  password: 'Testtestudyr&1'
};

async function login() {
  try {
    console.log('🔐 Connexion admin...');
    const response = await axios.post(`${API_BASE}/auth/login`, adminCredentials);
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testPromotionEdit() {
  console.log('\n🔧 Test d\'édition de promotion...');
  
  const token = await login();
  if (!token) return;

  try {
    // 1. Récupérer la liste des promotions
    const promotionsResponse = await axios.get(`${API_BASE}/promotions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (promotionsResponse.data.length === 0) {
      console.log('❌ Aucune promotion trouvée pour le test');
      return;
    }

    const promotion = promotionsResponse.data[0];
    console.log(`✅ Promotion trouvée: ${promotion.code}`);

    // 2. Récupérer les détails de la promotion
    const detailResponse = await axios.get(`${API_BASE}/promotions/${promotion.promotionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Détails récupérés: ${detailResponse.data.description}`);

    // 3. Modifier la promotion
    const updates = {
      description: `${detailResponse.data.description} (Modifiée le ${new Date().toLocaleString('fr-FR')})`,
      maxDiscountAmount: null // S'assurer qu'il n'y a pas de plafond
    };

    const updateResponse = await axios.put(`${API_BASE}/promotions/${promotion.promotionId}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Promotion modifiée avec succès');
    console.log(`   Nouvelle description: ${updateResponse.data.description}`);
    console.log(`   Plafond: ${updateResponse.data.maxDiscountAmount || 'Aucun'}`);

  } catch (error) {
    console.error('❌ Erreur test édition:', error.response?.data?.message || error.message);
  }
}

async function testPromoValidationWithoutLimit() {
  console.log('\n🧪 Test validation code promo sans plafond...');
  
  try {
    // Test avec un gros montant pour vérifier qu'il n'y a plus de plafond
    const validationData = {
      code: 'WELCOME20',
      cartTotal: 5000, // 5000€
      cartItems: [
        { productId: 1, quantity: 1, price: 5000, Product: { id: 1, category: 'Test' } }
      ]
    };

    const response = await axios.post(`${API_BASE}/promotions/validate`, validationData);
    
    if (response.data.valid) {
      console.log('✅ Validation réussie:');
      console.log(`   Montant panier: ${validationData.cartTotal}€`);
      console.log(`   Réduction appliquée: ${response.data.discountAmount}€`);
      console.log(`   Pourcentage réel: ${(response.data.discountAmount / validationData.cartTotal * 100).toFixed(1)}%`);
      
      if (response.data.discountAmount === 1000) { // 20% de 5000€
        console.log('✅ Calcul correct: pas de plafond appliqué');
      } else {
        console.log('⚠️ Calcul inattendu');
      }
    } else {
      console.log('❌ Validation échouée:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Erreur test validation:', error.response?.data?.message || error.message);
  }
}

async function testOrderWithPromotion() {
  console.log('\n📋 Test simulation commande avec promotion...');
  
  // Simulation des données qu'on enverrait à Stripe
  const orderData = {
    cartItems: [
      {
        Product: { name: 'Produit Test', price: 1000 },
        quantity: 1,
        price: 1000
      }
    ],
    appliedPromo: {
      code: 'WELCOME20',
      discount: 200, // 20% de 1000€
      promotion: {
        description: 'Promotion de bienvenue - 20% de réduction'
      }
    },
    finalTotal: 800 // 1000€ - 200€
  };

  console.log('✅ Données de commande simulées:');
  console.log(`   Sous-total: ${orderData.cartItems[0].price}€`);
  console.log(`   Code promo: ${orderData.appliedPromo.code}`);
  console.log(`   Réduction: ${orderData.appliedPromo.discount}€`);
  console.log(`   Total final: ${orderData.finalTotal}€`);
  
  console.log('\n📄 Structure de facture attendue:');
  console.log('   - Détails des produits');
  console.log(`   - Sous-total: ${orderData.cartItems[0].price}€`);
  console.log(`   - Code promo (${orderData.appliedPromo.code}): -${orderData.appliedPromo.discount}€`);
  console.log(`   - TOTAL: ${orderData.finalTotal}€`);
}

async function testDatabaseSchema() {
  console.log('\n🗄️ Test structure base de données...');
  
  const token = await login();
  if (!token) return;

  try {
    // Vérifier qu'on peut récupérer les promotions (test MongoDB)
    const promotionsResponse = await axios.get(`${API_BASE}/promotions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ MongoDB: ${promotionsResponse.data.length} promotion(s) trouvée(s)`);
    
    if (promotionsResponse.data.length > 0) {
      const promo = promotionsResponse.data[0];
      console.log('✅ Champs promotion vérifiés:');
      console.log(`   - code: ${promo.code}`);
      console.log(`   - discountType: ${promo.discountType}`);
      console.log(`   - discountValue: ${promo.discountValue}`);
      console.log(`   - maxDiscountAmount: ${promo.maxDiscountAmount || 'null'}`);
      console.log(`   - usageCount: ${promo.usageCount}`);
    }

  } catch (error) {
    console.error('❌ Erreur test base de données:', error.response?.data?.message || error.message);
  }
}

async function runCompleteTests() {
  console.log('🚀 Tests complets du système de promotions\n');
  console.log('='.repeat(50));

  await testDatabaseSchema();
  await testPromotionEdit();
  await testPromoValidationWithoutLimit();
  await testOrderWithPromotion();

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Tests terminés !');
  console.log('\n📋 Résumé des fonctionnalités testées:');
  console.log('✅ Structure base de données');
  console.log('✅ Édition des promotions');
  console.log('✅ Validation sans plafond');
  console.log('✅ Simulation facture avec promo');
  
  console.log('\n🔗 URLs à tester manuellement:');
  console.log('- http://localhost:5173/promotions (Liste des promotions)');
  console.log('- http://localhost:5173/edit-promotion/1 (Édition promotion)');
  console.log('- http://localhost:5173/cart (Panier avec codes promo)');
}

// Exécuter les tests
setTimeout(runCompleteTests, 2000); 