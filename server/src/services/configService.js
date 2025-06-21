import AppConfig from '../models/AppConfig.js';

// Cache en mémoire pour éviter trop de requêtes DB
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class ConfigService {
  
  /**
   * Récupérer une valeur de configuration
   * @param {string} key - Clé de configuration
   * @param {any} defaultValue - Valeur par défaut si la clé n'existe pas
   * @returns {Promise<any>} - Valeur de configuration
   */
  static async get(key, defaultValue = null) {
    try {
      // Vérifier le cache
      const cached = configCache.get(key);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.value;
      }

      // Récupérer depuis la DB
      const config = await AppConfig.findOne({
        where: { configKey: key }
      });

      if (!config) {
        return defaultValue;
      }

      // Convertir selon le type
      let value = config.configValue;
      switch (config.dataType) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.error(`Erreur parsing JSON pour ${key}:`, e);
            value = defaultValue;
          }
          break;
        // 'string' reste tel quel
      }

      // Mettre en cache
      configCache.set(key, {
        value,
        timestamp: Date.now()
      });

      return value;
    } catch (error) {
      console.error(`Erreur récupération config ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Définir une valeur de configuration
   * @param {string} key - Clé de configuration
   * @param {any} value - Valeur à stocker
   * @param {string} dataType - Type de données ('string', 'number', 'boolean', 'json')
   * @param {string} description - Description de la configuration
   * @returns {Promise<boolean>} - Succès de l'opération
   */
  static async set(key, value, dataType = 'string', description = null) {
    try {
      // Convertir la valeur en string pour le stockage
      let stringValue = value;
      if (dataType === 'json') {
        stringValue = JSON.stringify(value);
      } else if (dataType === 'boolean') {
        stringValue = value ? 'true' : 'false';
      } else {
        stringValue = String(value);
      }

      // Upsert en base
      const [config, created] = await AppConfig.upsert({
        configKey: key,
        configValue: stringValue,
        dataType,
        description
      });

      // Invalider le cache
      configCache.delete(key);

      console.log(`✅ Configuration ${key} ${created ? 'créée' : 'mise à jour'}: ${stringValue}`);
      return true;
    } catch (error) {
      console.error(`Erreur définition config ${key}:`, error);
      return false;
    }
  }

  /**
   * Récupérer toutes les configurations
   * @returns {Promise<Object>} - Objet avec toutes les configurations
   */
  static async getAll() {
    try {
      const configs = await AppConfig.findAll();
      const result = {};

      for (const config of configs) {
        let value = config.configValue;
        switch (config.dataType) {
          case 'number':
            value = parseFloat(value);
            break;
          case 'boolean':
            value = value === 'true';
            break;
          case 'json':
            try {
              value = JSON.parse(value);
            } catch (e) {
              console.error(`Erreur parsing JSON pour ${config.configKey}:`, e);
            }
            break;
        }
        result[config.configKey] = value;
      }

      return result;
    } catch (error) {
      console.error('Erreur récupération toutes configs:', error);
      return {};
    }
  }

  /**
   * Supprimer une configuration
   * @param {string} key - Clé de configuration
   * @returns {Promise<boolean>} - Succès de l'opération
   */
  static async delete(key) {
    try {
      const deleted = await AppConfig.destroy({
        where: { configKey: key }
      });

      if (deleted > 0) {
        configCache.delete(key);
        console.log(`✅ Configuration ${key} supprimée`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Erreur suppression config ${key}:`, error);
      return false;
    }
  }

  /**
   * Vider le cache
   */
  static clearCache() {
    configCache.clear();
    console.log('✅ Cache de configuration vidé');
  }

  /**
   * Initialiser les configurations par défaut
   */
  static async initializeDefaults() {
    try {
      const defaults = [
        {
          key: 'low_stock_threshold',
          value: 10,
          type: 'number',
          description: 'Seuil de stock critique en dessous duquel une alerte est envoyée'
        },
        {
          key: 'email_notifications_enabled',
          value: true,
          type: 'boolean',
          description: 'Activer ou désactiver les notifications par email'
        },
        {
          key: 'newsletter_from_name',
          value: 'E-Commerce Store',
          type: 'string',
          description: 'Nom de l\'expéditeur pour les newsletters'
        },
        {
          key: 'auto_restock_alerts',
          value: true,
          type: 'boolean',
          description: 'Envoyer automatiquement des alertes de réapprovisionnement'
        }
      ];

      for (const config of defaults) {
        const existing = await AppConfig.findOne({
          where: { configKey: config.key }
        });

        if (!existing) {
          await this.set(config.key, config.value, config.type, config.description);
        }
      }

      console.log('✅ Configurations par défaut initialisées');
    } catch (error) {
      console.error('❌ Erreur initialisation configurations par défaut:', error);
    }
  }
}

export default ConfigService; 