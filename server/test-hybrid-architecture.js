#!/usr/bin/env node

/**
 * 🔥 TEST ARCHITECTURE HYBRIDE
 * Valide l'écriture double PostgreSQL + MongoDB
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Charger les variables d'environnement
dotenv.config();

// Configuration
process.env.NODE_ENV = 'development';

// Vérifier les variables d'environnement essentielles
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie dans .env');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI non définie dans .env');
  process.exit(1);
}

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

// Utilisateur admin de test
const testUser = {
  email: 'admin@test.com',
  password: 'admin123'
};

let authToken = '';

// Fonction pour authentifier l'utilisateur
async function authenticateUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    if (data.token) {
      authToken = data.token;
      console.log('✅ Authentification réussie');
      return true;
    } else {
      console.error('❌ Échec de l\'authentification:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error.message);
    return false;
  }
}

// Test: Création d'un produit avec stock initial
async function testCreateProduct() {
  console.log('\n🧪 Test: Création d\'un produit avec stock initial');
  
  try {
    const productData = {
      name: `Produit Test Architecture Hybride ${Date.now()}`,
      description: 'Test de l\'architecture hybride complète',
      price: 29.99, // En euros, sera converti en centimes
      stock: 100,
      category: 'test',
      onSale: false
    };

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(productData)
    });

    const result = await response.json();
    
    if (response.ok && result.product) {
      console.log(`✅ Produit créé - ID: ${result.product.id}`);
      console.log(`   PostgreSQL Stock: ${result.product.stock}`);
      console.log(`   MongoDB Stock: ${result.productMongo?.stock || 'N/A'}`);
      return result.product.id;
    } else {
      console.error('❌ Erreur création produit:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur création produit:', error.message);
    return null;
  }
}

// Test: Mise à jour de stock via productController
async function testUpdateProductStock(productId) {
  console.log('\n🧪 Test: Mise à jour de stock via productController');
  
  try {
    const updateData = {
      stock: 150 // Augmentation de 50 unités
    };

    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Stock mis à jour via productController');
      console.log(`   Nouveau stock PostgreSQL: ${result.product.stock}`);
      console.log(`   Nouveau stock MongoDB: ${result.mongoProduct?.stock || 'N/A'}`);
      return true;
    } else {
      console.error('❌ Erreur mise à jour produit:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour produit:', error.message);
    return false;
  }
}

// Test: Mouvement manuel de stock via stockController
async function testManualStockMovement(productId) {
  console.log('\n🧪 Test: Mouvement manuel de stock via stockController');
  
  try {
    const movementData = {
      productId: productId,
      movementType: 'adjustment',
      quantityChange: -25, // Diminution de 25 unités
      reason: 'Test architecture hybride - ajustement',
      notes: 'Test intégration complète'
    };

    const response = await fetch(`${API_BASE_URL}/stock/movement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(movementData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Mouvement de stock enregistré via stockController');
      console.log(`   Type: ${result.movement?.movementType}`);
      console.log(`   Changement: ${result.movement?.quantityChange}`);
      console.log(`   Stock après: ${result.movement?.quantityAfter}`);
      return true;
    } else {
      console.error('❌ Erreur mouvement stock:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur mouvement stock:', error.message);
    return false;
  }
}

// Test: Vérification de l'évolution des stocks
async function testStockEvolution() {
  console.log('\n🧪 Test: Vérification de l\'évolution des stocks');
  
  try {
    const response = await fetch(`${API_BASE_URL}/stock/evolution-chart`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const result = await response.json();
    
    if (response.ok && result.labels) {
      console.log('✅ Évolution des stocks récupérée');
      console.log(`   Points de données: ${result.labels.length}`);
      console.log(`   Stock total actuel: ${result.datasets?.[0]?.data?.slice(-1)[0] || 'N/A'}`);
      return true;
    } else {
      console.error('❌ Erreur évolution stocks:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur évolution stocks:', error.message);
    return false;
  }
}

// Test: Évolution spécifique d'un produit
async function testProductEvolution(productId) {
  console.log('\n🧪 Test: Évolution spécifique du produit');
  
  try {
    const response = await fetch(`${API_BASE_URL}/stock/product/${productId}/evolution`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const result = await response.json();
    
    if (response.ok && result.chartData) {
      console.log('✅ Évolution du produit récupérée');
      console.log(`   Points de données: ${result.chartData.labels?.length || 0}`);
      console.log(`   Mouvements: ${result.movements?.length || 0}`);
      return true;
    } else {
      console.error('❌ Erreur évolution produit:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur évolution produit:', error.message);
    return false;
  }
}

// Test: Historique des mouvements
async function testMovementHistory() {
  console.log('\n🧪 Test: Historique des mouvements de stock');
  
  try {
    const response = await fetch(`${API_BASE_URL}/stock/movements?limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const result = await response.json();
    
    if (response.ok && result.movements) {
      console.log('✅ Historique des mouvements récupéré');
      console.log(`   Nombre de mouvements: ${result.movements.length}`);
      console.log(`   Total dans la base: ${result.totalCount}`);
      
      // Afficher les derniers mouvements
      result.movements.slice(0, 3).forEach((movement, index) => {
        console.log(`   ${index + 1}. ${movement.productName} - ${movement.movementTypeLabel} - ${movement.quantityChange > 0 ? '+' : ''}${movement.quantityChange}`);
      });
      
      return true;
    } else {
      console.error('❌ Erreur historique mouvements:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur historique mouvements:', error.message);
    return false;
  }
}

// Fonction principale de test
async function runCompleteHybridTest() {
  console.log('🚀 TEST COMPLET ARCHITECTURE HYBRIDE');
  console.log('=====================================');
  
  // Authentification
  const isAuthenticated = await authenticateUser();
  if (!isAuthenticated) {
    console.log('❌ Impossible de continuer sans authentification');
    return;
  }

  // Tests séquentiels
  const productId = await testCreateProduct();
  if (!productId) {
    console.log('❌ Impossible de continuer sans produit de test');
    return;
  }

  const tests = [
    () => testUpdateProductStock(productId),
    () => testManualStockMovement(productId),
    () => testStockEvolution(),
    () => testProductEvolution(productId),
    () => testMovementHistory()
  ];

  let successCount = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    const success = await test();
    if (success) successCount++;
    
    // Petit délai entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Résumé final
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('===================');
  console.log(`✅ Tests réussis: ${successCount}/${totalTests}`);
  console.log(`❌ Tests échoués: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS ! Architecture hybride opérationnelle !');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.');
  }
  
  console.log(`\n🧪 Produit de test créé avec l'ID: ${productId}`);
  console.log('   Vous pouvez maintenant tester l\'interface web avec ce produit.');
}

// Exécution du test
runCompleteHybridTest(); 