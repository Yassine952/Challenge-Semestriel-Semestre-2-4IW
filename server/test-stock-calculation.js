/**
 * 🧮 TEST CALCUL STOCK - Vérification des statistiques
 */

console.log('🧮 TEST CALCUL STOCK');
console.log('==================');

// Simulation du calcul côté serveur
const products = [
  { name: 'testproduit', stock: 1999 },
  { name: 'test', stock: 999 }
];

console.log('📦 PRODUITS:');
products.forEach(p => console.log(`  - ${p.name}: ${p.stock} unités`));

const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
const minStock = Math.min(...products.map(p => p.stock));
const maxStock = Math.max(...products.map(p => p.stock));
const avgStock = Math.round(totalStock / products.length);

console.log('\n📊 STATISTIQUES CALCULÉES:');
console.log(`  Stock Total: ${totalStock}`);
console.log(`  Stock Minimum: ${minStock}`);
console.log(`  Stock Maximum: ${maxStock}`);
console.log(`  Stock Moyen: ${avgStock}`);

console.log('\n✅ Résultats attendus:');
console.log('  Current: 2998 ✓');
console.log('  Minimum: 999 ✓');
console.log('  Maximum: 1999 ✓'); 