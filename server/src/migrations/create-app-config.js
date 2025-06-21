import sequelize from '../config/database.js';
import AppConfig from '../models/AppConfig.js';

const createAppConfigTable = async () => {
  try {
    console.log('🔧 Création de la table app_config...');
    
    // Créer la table
    await AppConfig.sync({ force: false });
    
    // Vérifier si la configuration du seuil de stock existe déjà
    const existingConfig = await AppConfig.findOne({
      where: { configKey: 'low_stock_threshold' }
    });
    
    if (!existingConfig) {
      // Insérer la configuration par défaut
      await AppConfig.create({
        configKey: 'low_stock_threshold',
        configValue: '10',
        description: 'Seuil de stock critique en dessous duquel une alerte est envoyée',
        dataType: 'number'
      });
      console.log('✅ Configuration par défaut du seuil de stock créée (10)');
    } else {
      console.log(`✅ Configuration du seuil de stock existe déjà (${existingConfig.configValue})`);
    }
    
    // Autres configurations par défaut
    const defaultConfigs = [
      {
        configKey: 'email_notifications_enabled',
        configValue: 'true',
        description: 'Activer ou désactiver les notifications par email',
        dataType: 'boolean'
      },
      {
        configKey: 'newsletter_from_name',
        configValue: 'E-Commerce Store',
        description: 'Nom de l\'expéditeur pour les newsletters',
        dataType: 'string'
      },
      {
        configKey: 'auto_restock_alerts',
        configValue: 'true',
        description: 'Envoyer automatiquement des alertes de réapprovisionnement',
        dataType: 'boolean'
      }
    ];
    
    for (const config of defaultConfigs) {
      const existing = await AppConfig.findOne({
        where: { configKey: config.configKey }
      });
      
      if (!existing) {
        await AppConfig.create(config);
        console.log(`✅ Configuration ${config.configKey} créée`);
      }
    }
    
    console.log('✅ Table app_config et configurations par défaut créées avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table app_config:', error);
    throw error;
  }
};

// Exécuter la migration si ce fichier est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  createAppConfigTable()
    .then(() => {
      console.log('Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration échouée:', error);
      process.exit(1);
    });
}

export default createAppConfigTable; 