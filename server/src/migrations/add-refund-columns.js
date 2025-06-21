// Migration pour ajouter les colonnes de remboursement à la table Order
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const addRefundColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('🔄 Ajout des colonnes de remboursement...');
    
    // Ajouter les colonnes Stripe
    await queryInterface.addColumn('Orders', 'stripePaymentIntentId', {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Orders', 'stripeChargeId', {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    // Ajouter les colonnes de remboursement
    await queryInterface.addColumn('Orders', 'refundRequested', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    });
    
    await queryInterface.addColumn('Orders', 'refundAmount', {
      type: DataTypes.FLOAT,
      allowNull: true
    });
    
    await queryInterface.addColumn('Orders', 'refundId', {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Orders', 'refundStatus', {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Orders', 'refundDate', {
      type: DataTypes.DATE,
      allowNull: true
    });
    
    console.log('✅ Colonnes de remboursement ajoutées avec succès !');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Les colonnes existent déjà, migration ignorée');
    } else {
      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  }
};

// Exécuter la migration si ce fichier est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  addRefundColumns()
    .then(() => {
      console.log('Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur de migration:', error);
      process.exit(1);
    });
}

export default addRefundColumns; 