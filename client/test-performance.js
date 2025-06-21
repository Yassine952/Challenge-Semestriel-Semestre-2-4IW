import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

async function testSearchPerformance() {
  console.log('🚀 Test de performance de la recherche\n');

  const searchQueries = [
    { query: 'phone', brand: 'Apple' },
    { query: 'samsung', onPromotion: true },
    { category: 'Electronics', brand: 'Sony' },
    { minPrice: 100, maxPrice: 500 },
    { query: 'laptop', brand: 'Dell', category: 'Computers' }
  ];

  for (const params of searchQueries) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${API_BASE}/products/search`, { params });
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Recherche: ${JSON.stringify(params)}`);
      console.log(`   Résultats: ${response.data.products?.length || 0} produits`);
      console.log(`   Temps: ${duration}ms`);
      console.log(`   Performance: ${duration < 500 ? '🟢 Rapide' : duration < 1000 ? '🟡 Moyen' : '🔴 Lent'}\n`);
      
    } catch (error) {
      console.error(`❌ Erreur pour ${JSON.stringify(params)}:`, error.message);
    }
  }
}

// Test de charge
async function testLoadSearch() {
  console.log('⚡ Test de charge - 10 requêtes simultanées\n');
  
  const promises = Array(10).fill().map(() => 
    axios.get(`${API_BASE}/products/search`, {
      params: { query: 'test', page: 1, limit: 20 }
    })
  );

  const startTime = Date.now();
  
  try {
    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 10 requêtes simultanées terminées en ${duration}ms`);
    console.log(`   Moyenne par requête: ${duration / 10}ms`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test de charge:', error.message);
  }
}

setTimeout(async () => {
  await testSearchPerformance();
  await testLoadSearch();
}, 2000); 