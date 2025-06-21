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

async function findPromotionByCode(token, code) {
  try {
    const response = await axios.get(`${API_BASE}/promotions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.find(promo => promo.code === code);
  } catch (error) {
    console.error('❌ Erreur recherche promotion:', error.response?.data?.message || error.message);
    return null;
  }
}

async function updatePromotion(token, promotionId, updates) {
  try {
    const response = await axios.put(`${API_BASE}/promotions/${promotionId}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur mise à jour promotion:', error.response?.data?.message || error.message);
    return null;
  }
}

async function fixWelcome20Promotion() {
  console.log('🔧 Correction de la promotion WELCOME20\n');

  // 1. Connexion
  const token = await login();
  if (!token) return;

  // 2. Trouver la promotion WELCOME20
  console.log('🔍 Recherche de la promotion WELCOME20...');
  const promotion = await findPromotionByCode(token, 'WELCOME20');
  
  if (!promotion) {
    console.log('❌ Promotion WELCOME20 non trouvée');
    return;
  }

  console.log('✅ Promotion trouvée:');
  console.log(`   ID: ${promotion.id || promotion.promotionId}`);
  console.log(`   Code: ${promotion.code}`);
  console.log(`   Réduction: ${promotion.discountValue}%`);
  console.log(`   Plafond actuel: ${promotion.maxDiscountAmount}€`);

  // 3. Mettre à jour la promotion pour retirer le plafond
  console.log('\n🔧 Suppression du plafond de réduction...');
  const updates = {
    maxDiscountAmount: null, // Retirer le plafond
    description: 'Promotion de bienvenue - 20% de réduction (sans plafond)'
  };

  const promotionId = promotion.id || promotion.promotionId;
  const updatedPromotion = await updatePromotion(token, promotionId, updates);

  if (updatedPromotion) {
    console.log('✅ Promotion mise à jour avec succès !');
    console.log(`   Nouveau plafond: ${updatedPromotion.maxDiscountAmount || 'Aucun'}`);
    console.log(`   Description: ${updatedPromotion.description}`);
    
    console.log('\n🧮 Exemples de calcul:');
    console.log('   Panier 100€ → Réduction 20€ (20%)');
    console.log('   Panier 500€ → Réduction 100€ (20%)');
    console.log('   Panier 4000€ → Réduction 800€ (20%)');
  }
}

// Créer aussi une promotion de test sans plafond
async function createUnlimitedPromotion() {
  console.log('\n🎫 Création d\'une promotion de test sans plafond...');

  const token = await login();
  if (!token) return;

  const newPromotion = {
    code: 'TEST20UNLIMITED',
    description: 'Promotion test - 20% sans plafond',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 50,
    maxDiscountAmount: null, // Pas de plafond
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 100,
    applicationType: 'all',
    isActive: true
  };

  try {
    const response = await axios.post(`${API_BASE}/promotions`, newPromotion, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Nouvelle promotion créée:');
    console.log(`   Code: ${response.data.code}`);
    console.log(`   Réduction: ${response.data.discountValue}%`);
    console.log(`   Plafond: ${response.data.maxDiscountAmount || 'Aucun'}`);
  } catch (error) {
    console.error('❌ Erreur création promotion:', error.response?.data?.message || error.message);
  }
}

// Exécuter les corrections
setTimeout(async () => {
  await fixWelcome20Promotion();
  await createUnlimitedPromotion();
  
  console.log('\n🎉 Corrections terminées !');
  console.log('\nVous pouvez maintenant tester:');
  console.log('1. Code WELCOME20 (modifié, sans plafond)');
  console.log('2. Code TEST20UNLIMITED (nouveau, sans plafond)');
}, 2000); 