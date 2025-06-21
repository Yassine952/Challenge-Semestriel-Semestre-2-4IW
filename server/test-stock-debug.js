/**
 * 🔧 TEST DEBUG STOCK - Vérification du calcul du stock total
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';

async function testStockDebug() {
  console.log('🔍 TEST DEBUG STOCK - Vérification du calcul');
  console.log('============================================================');
  
  try {
    // Simuler un token d'admin (vous devrez adapter selon votre système)
    const response = await fetch(`${BASE_URL}/stock/debug`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Si vous avez besoin d'un token, ajoutez-le ici
        // 'Authorization': 'Bearer YOUR_TOKEN'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📊 RÉSULTATS DEBUG:');
    console.log('==================');
    
    console.log('\n🔵 MONGODB:');
    console.log(`  Produits: ${data.mongodb.productCount}`);
    console.log(`  Stock Total: ${data.mongodb.totalStock}`);
    console.log(`  Stock Min: ${data.mongodb.aggregation?.minStock || 'N/A'}`);
    console.log(`  Stock Max: ${data.mongodb.aggregation?.maxStock || 'N/A'}`);
    console.log(`  Stock Moyen: ${data.mongodb.aggregation?.avgStock || 'N/A'}`);
    
    console.log('\n🟢 POSTGRESQL:');
    console.log(`  Produits: ${data.postgresql.productCount}`);
    console.log(`  Stock Total: ${data.postgresql.totalStock}`);
    
    console.log('\n⚖️ COMPARAISON:');
    console.log(`  Différence Stock: ${data.comparison.stockDifference}`);
    console.log(`  Différence Produits: ${data.comparison.productCountDifference}`);
    
    if (data.comparison.stockDifference !== 0) {
      console.log('\n⚠️ PROBLÈME DÉTECTÉ: Les stocks ne correspondent pas !');
      console.log('\n📋 DÉTAIL PRODUITS MONGODB:');
      data.mongodb.products.forEach(product => {
        console.log(`  - ${product.name}: ${product.stock} unités`);
      });
      
      console.log('\n📋 DÉTAIL PRODUITS POSTGRESQL:');
      data.postgresql.products.forEach(product => {
        console.log(`  - ${product.name}: ${product.stock} unités`);
      });
    } else {
      console.log('\n✅ STOCKS COHÉRENTS entre MongoDB et PostgreSQL');
    }
    
  } catch (error) {
    console.error('❌ ERREUR LORS DU TEST:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 CONSEIL: Vous devez être connecté en tant qu\'admin pour accéder à cette route');
      console.log('   Connectez-vous sur l\'interface web d\'abord, puis réessayez');
    }
  }
}

testStockDebug(); 