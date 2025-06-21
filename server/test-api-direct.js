/**
 * 🧪 TEST API DIRECT - Test de l'endpoint evolution-chart
 */

import { getGlobalStockEvolution } from './src/services/hybridStockService.js';
import ProductMongo from './src/models/ProductMongo.js';

console.log('🧪 TEST API DIRECT');
console.log('==================');

try {
  console.log('📊 Test getGlobalStockEvolution...');
  const evolution = await getGlobalStockEvolution('3m');
  console.log('✅ Evolution:', evolution);

  console.log('\n📊 Test ProductMongo.aggregate...');
  const statsResult = await ProductMongo.aggregate([
    {
      $group: {
        _id: null,
        totalStock: { $sum: '$stock' },
        productCount: { $sum: 1 },
        minStock: { $min: '$stock' },
        maxStock: { $max: '$stock' },
        avgStock: { $avg: '$stock' }
      }
    }
  ]);
  
  console.log('✅ Stats:', statsResult[0] || 'Aucune donnée');

  console.log('\n🎯 Résultats attendus:');
  console.log('  Total: 2998 (1999 + 999)');
  console.log('  Min: 999');
  console.log('  Max: 1999');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  console.error('Stack:', error.stack);
}

process.exit(0); 