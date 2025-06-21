// Script simple pour créer les données de stock via l'API
import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000';

async function createStockData() {
  try {
    console.log('🚀 Création des données de stock via l\'API...\n');

    // 1. Obtenir un token admin (remplacez par vos vraies credentials)
    console.log('🔐 Connexion admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com', // Remplacez par votre email admin
        password: 'admin123' // Remplacez par votre mot de passe admin
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Impossible de se connecter. Vérifiez vos credentials admin.');
    }

    const { token } = await loginResponse.json();
    console.log('✅ Connexion réussie');

    // 2. Obtenir la liste des produits
    console.log('📦 Récupération des produits...');
    const productsResponse = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!productsResponse.ok) {
      throw new Error('Impossible de récupérer les produits');
    }

    const products = await productsResponse.json();
    console.log(`✅ ${products.length} produits trouvés`);

    if (products.length === 0) {
      console.log('⚠️ Aucun produit trouvé. Créez des produits d\'abord.');
      return;
    }

    // 3. Créer des mouvements de stock pour chaque produit
    console.log('📊 Création des mouvements de stock...');
    
    for (const product of products) {
      if (product.stock > 0) {
        console.log(`   • ${product.name} (${product.stock} unités)`);

        // Mouvement initial
        await createStockMovement(token, {
          productId: product.id,
          movementType: 'initial',
          quantityChange: product.stock,
          reason: `Stock initial pour ${product.name}`,
          cost: product.price * 0.6
        });

        // Quelques mouvements historiques
        const movements = [
          { type: 'purchase', change: Math.floor(product.stock * 0.1), reason: 'Réapprovisionnement', days: 7 },
          { type: 'sale', change: -Math.floor(product.stock * 0.05), reason: 'Vente', days: 5 },
          { type: 'sale', change: -Math.floor(product.stock * 0.03), reason: 'Vente', days: 3 },
          { type: 'sale', change: -Math.floor(product.stock * 0.02), reason: 'Vente récente', days: 1 }
        ];

        for (const movement of movements) {
          if (movement.change !== 0) {
            await createStockMovement(token, {
              productId: product.id,
              movementType: movement.type,
              quantityChange: movement.change,
              reason: movement.reason,
              cost: movement.type === 'purchase' ? product.price * 0.6 : null
            });
          }
        }
      }
    }

    console.log('\n🎉 Données de stock créées avec succès !');
    console.log('📊 Le dashboard devrait maintenant afficher les vraies données.');
    console.log('\n💡 Testez maintenant :');
    console.log('   1. Rechargez votre dashboard');
    console.log('   2. Vérifiez que les chiffres correspondent à vos produits');
    console.log('   3. Testez l\'ajout/suppression au panier');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n🔧 Solutions :');
    console.log('   1. Vérifiez que votre serveur fonctionne sur localhost:8000');
    console.log('   2. Vérifiez vos credentials admin');
    console.log('   3. Assurez-vous d\'avoir des produits en base');
  }
}

async function createStockMovement(token, data) {
  try {
    const response = await fetch(`${API_URL}/stock/movement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`⚠️ Erreur mouvement ${data.movementType}:`, error);
    }
  } catch (error) {
    console.log(`⚠️ Erreur réseau pour ${data.movementType}:`, error.message);
  }
}

createStockData(); 