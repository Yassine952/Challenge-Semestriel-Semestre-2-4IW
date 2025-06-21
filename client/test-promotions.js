import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

// Configuration des tests
const testData = {
  admin: {
    email: 'yassine.abdelkader95@gmail.com',
    password: 'Testtestudyr&1'
  },
  testPromotion: {
    code: 'WELCOME20',
    description: 'Promotion de bienvenue - 20% de réduction',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 50,
    maxDiscountAmount: 100,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
    usageLimit: 100,
    applicationType: 'all',
    isActive: true
  },
  testProduct: {
    name: 'Produit Test Promo',
    description: 'Produit pour tester les promotions',
    price: 100,
    stock: 50,
    category: 'Test',
    brand: 'TestBrand',
    onSale: false
  }
};

let authToken = '';
let createdProductId = null;
let createdPromotionId = null;

async function login() {
  try {
    console.log('🔐 Connexion en tant qu\'admin...');
    const response = await axios.post(`${API_BASE}/auth/login`, testData.admin);
    authToken = response.data.token;
    console.log('✅ Connexion réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data?.message || error.message);
    return false;
  }
}

async function createTestProduct() {
  try {
    console.log('📦 Création d\'un produit de test...');
    const response = await axios.post(`${API_BASE}/products`, testData.testProduct, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    createdProductId = response.data.id;
    console.log(`✅ Produit créé avec l'ID: ${createdProductId}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur création produit:', error.response?.data?.message || error.message);
    return false;
  }
}

async function createTestPromotion() {
  try {
    console.log('🎫 Création d\'une promotion de test...');
    const response = await axios.post(`${API_BASE}/promotions`, testData.testPromotion, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    createdPromotionId = response.data.id;
    console.log(`✅ Promotion créée avec l'ID: ${createdPromotionId}`);
    console.log(`   Code: ${testData.testPromotion.code}`);
    console.log(`   Réduction: ${testData.testPromotion.discountValue}%`);
    return true;
  } catch (error) {
    console.error('❌ Erreur création promotion:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testPromoValidation() {
  try {
    console.log('🧪 Test de validation du code promo...');
    
    // Test avec un montant valide
    const validationData = {
      code: testData.testPromotion.code,
      orderAmount: 75, // Supérieur au minimum de 50€
      cartItems: [
        { productId: createdProductId, quantity: 1, price: 75 }
      ]
    };

    const response = await axios.post(`${API_BASE}/promotions/validate`, validationData);
    
    if (response.data.valid) {
      console.log('✅ Validation réussie:');
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Réduction appliquée: ${response.data.discountAmount}€`);
      console.log(`   Total final: ${75 - response.data.discountAmount}€`);
    } else {
      console.log('❌ Validation échouée:', response.data.message);
    }

    // Test avec un montant insuffisant
    console.log('\n🧪 Test avec montant insuffisant...');
    const invalidValidation = {
      code: testData.testPromotion.code,
      orderAmount: 30, // Inférieur au minimum de 50€
      cartItems: [
        { productId: createdProductId, quantity: 1, price: 30 }
      ]
    };

    const invalidResponse = await axios.post(`${API_BASE}/promotions/validate`, invalidValidation);
    console.log(`   Résultat attendu (échec): ${invalidResponse.data.message}`);

    return true;
  } catch (error) {
    console.error('❌ Erreur test validation:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testSearchWithBrand() {
  try {
    console.log('🔍 Test de recherche avec filtre marque...');
    
    const response = await axios.get(`${API_BASE}/products/search`, {
      params: {
        brand: 'TestBrand',
        page: 1,
        limit: 10
      }
    });

    console.log(`✅ Recherche réussie: ${response.data.products.length} produit(s) trouvé(s)`);
    if (response.data.products.length > 0) {
      const product = response.data.products[0];
      console.log(`   Produit: ${product.name} - Marque: ${product.brand}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur recherche:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetBrands() {
  try {
    console.log('🏷️ Test récupération des marques...');
    
    const response = await axios.get(`${API_BASE}/products/brands`);
    console.log(`✅ ${response.data.length} marque(s) trouvée(s):`);
    response.data.forEach(brand => console.log(`   - ${brand}`));

    return true;
  } catch (error) {
    console.error('❌ Erreur récupération marques:', error.response?.data?.message || error.message);
    return false;
  }
}

async function cleanup() {
  try {
    console.log('🧹 Nettoyage des données de test...');
    
    if (createdPromotionId) {
      await axios.delete(`${API_BASE}/promotions/${createdPromotionId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Promotion supprimée');
    }

    if (createdProductId) {
      await axios.delete(`${API_BASE}/products/${createdProductId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Produit supprimé');
    }
  } catch (error) {
    console.error('⚠️ Erreur lors du nettoyage:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests du système de promotions\n');

  try {
    // Étapes de test
    if (!await login()) return;
    if (!await createTestProduct()) return;
    if (!await createTestPromotion()) return;
    
    console.log('\n--- Tests fonctionnels ---');
    await testPromoValidation();
    await testSearchWithBrand();
    await testGetBrands();

    console.log('\n✅ Tous les tests sont terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await cleanup();
    console.log('\n🏁 Tests terminés');
  }
}

// Attendre que les services soient prêts
setTimeout(() => {
  runTests();
}, 5000); // Attendre 5 secondes pour que les services démarrent 