import sequelize from '../config/database.js';
import Product from '../models/Product.js';

const addImageUrlColumn = async () => {
  try {
    console.log('🔄 Ajout de la colonne imageUrl à la table Product...');
    
    // Synchroniser la base de données avec le modèle mis à jour
    await sequelize.sync({ alter: true });
    
    console.log('✅ Migration terminée avec succès !');
    console.log('📝 La colonne imageUrl a été ajoutée à la table Product');
    
    // Vérifier que la colonne existe
    const tableDescription = await sequelize.getQueryInterface().describeTable('Products');
    if (tableDescription.imageUrl) {
      console.log('✅ Colonne imageUrl confirmée dans la table Products');
    } else {
      console.log('❌ Erreur: La colonne imageUrl n\'a pas été ajoutée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await sequelize.close();
  }
};

// Exécuter la migration si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  addImageUrlColumn();
}

export default addImageUrlColumn; 