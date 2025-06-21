import sequelize from '../config/database.js';
import StockHistory from '../models/StockHistory.js';

const createStockHistoryTable = async () => {
  try {
    console.log('🔄 Création de la table StockHistory...');
    
    // Synchroniser le modèle avec la base de données
    await StockHistory.sync({ force: false });
    
    console.log('✅ Table StockHistory créée avec succès !');
    
    // Afficher la structure de la table
    const tableDescription = await sequelize.getQueryInterface().describeTable('StockHistories');
    console.log('\n📋 Structure de la table StockHistory:');
    console.table(Object.keys(tableDescription).map(column => ({
      Colonne: column,
      Type: tableDescription[column].type,
      Nullable: tableDescription[column].allowNull ? 'Oui' : 'Non',
      Défaut: tableDescription[column].defaultValue || 'Aucun'
    })));
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table StockHistory:', error);
  }
};

// Exécuter la migration si ce script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  createStockHistoryTable()
    .then(() => {
      console.log('\n🎉 Migration terminée !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur de migration:', error);
      process.exit(1);
    });
}

export default createStockHistoryTable; 