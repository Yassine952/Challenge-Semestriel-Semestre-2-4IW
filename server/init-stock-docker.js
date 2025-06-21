// Initialisation du stock avec configuration Docker directe
import { Sequelize, DataTypes } from 'sequelize';

// Configuration directe pour Docker
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'ecommerce',
  username: 'postgres',
  password: 'password',
  logging: console.log
});

// Modèles définis directement
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Products'
});

const StockHistory = sequelize.define('StockHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movementType: {
    type: DataTypes.ENUM('initial', 'purchase', 'sale', 'adjustment', 'reservation', 'release', 'sale_confirmed', 'return'),
    allowNull: false
  },
  quantityBefore: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantityChange: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantityAfter: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

async function initStockSystem() {
  try {
    console.log('🚀 Initialisation du système de stock avec Docker...\n');

    // 1. Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL établie');

    // 2. Créer la table StockHistory
    await StockHistory.sync({ force: true });
    console.log('✅ Table StockHistory créée/réinitialisée');

    // 3. Récupérer tous vos produits
    const products = await Product.findAll();
    console.log(`📦 ${products.length} produits trouvés`);

    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé. Ajoutez des produits d\'abord.');
      process.exit(1);
    }

    // 4. Afficher le détail de vos produits
    console.log('\n📋 Vos produits:');
    let totalStock = 0;
    products.forEach(product => {
      const stock = product.stock || 0;
      totalStock += stock;
      console.log(`   • ${product.name}: ${stock} unités (${product.price}€)`);
    });
    
    console.log(`\n📊 Stock total calculé: ${totalStock} unités`);

    // 5. Créer les mouvements de stock
    console.log('\n📈 Création des mouvements de stock...');
    
    let movementsCreated = 0;
    
    for (const product of products) {
      if (product.stock > 0) {
        // Mouvement initial
        await StockHistory.create({
          productId: product.id,
          userId: 1,
          movementType: 'initial',
          quantityBefore: 0,
          quantityChange: product.stock,
          quantityAfter: product.stock,
          reason: `Stock initial - ${product.name}`,
          cost: product.price * 0.6,
          totalValue: product.stock * product.price,
          reference: `INIT_${product.id}`,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        });
        movementsCreated++;

        // Mouvements historiques pour créer un graphique
        const movements = [
          { days: 25, type: 'purchase', percent: 0.15, reason: 'Réapprovisionnement' },
          { days: 20, type: 'sale', percent: -0.08, reason: 'Ventes' },
          { days: 15, type: 'purchase', percent: 0.10, reason: 'Réapprovisionnement' },
          { days: 10, type: 'sale', percent: -0.06, reason: 'Ventes' },
          { days: 5, type: 'sale', percent: -0.04, reason: 'Ventes récentes' },
          { days: 2, type: 'sale', percent: -0.02, reason: 'Ventes très récentes' }
        ];

        let currentStock = product.stock;
        
        for (const movement of movements) {
          const change = Math.floor(product.stock * Math.abs(movement.percent));
          if (change > 0) {
            const actualChange = movement.percent > 0 ? change : -change;
            const previousStock = currentStock - actualChange;
            const movementDate = new Date(Date.now() - movement.days * 24 * 60 * 60 * 1000);
            
            await StockHistory.create({
              productId: product.id,
              userId: 1,
              movementType: movement.type,
              quantityBefore: previousStock,
              quantityChange: actualChange,
              quantityAfter: currentStock,
              reason: movement.reason,
              cost: movement.type === 'purchase' ? product.price * 0.6 : null,
              totalValue: currentStock * product.price,
              reference: `HIST_${product.id}_${movement.days}D`,
              createdAt: movementDate,
              updatedAt: movementDate
            });
            movementsCreated++;
          }
        }
      }
    }

    // 6. Résultats
    console.log('\n🎉 Initialisation terminée avec succès !');
    console.log(`   📦 Produits traités: ${products.length}`);
    console.log(`   📊 Stock total: ${totalStock} unités`);
    console.log(`   📈 Mouvements créés: ${movementsCreated}`);
    
    console.log('\n✅ Votre dashboard devrait maintenant afficher:');
    console.log(`   📊 Stock Actuel: ${totalStock} (au lieu de 35855)`);
    console.log(`   📈 Graphique avec évolution réaliste`);
    console.log(`   🔄 Données basées sur vos vrais produits`);

    console.log('\n🎯 Prochaines étapes:');
    console.log('   1. Rechargez votre dashboard');
    console.log('   2. Cliquez sur "Actualiser" dans le widget');
    console.log('   3. Vérifiez que les chiffres correspondent');
    console.log('   4. Testez l\'ajout/suppression au panier');

    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
    
    console.log('\n🔧 Vérifications:');
    console.log('   1. Docker est-il démarré ?');
    console.log('   2. PostgreSQL est-il accessible sur localhost:5432 ?');
    console.log('   3. La base "ecommerce" existe-t-elle ?');
    
    process.exit(1);
  }
}

initStockSystem(); 