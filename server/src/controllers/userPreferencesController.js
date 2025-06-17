import User from '../models/User.js';
import UserMongo from '../models/UserMongo.js';
import AlertHistory from '../models/AlertHistory.js';
import Product from '../models/Product.js';

export const getUserAlertPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const userMongo = await UserMongo.findOne({ userId });
    if (!userMongo) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const preferences = {
      alertNewProducts: userMongo.alertNewProducts,
      alertRestock: userMongo.alertRestock,
      alertPriceChanges: userMongo.alertPriceChanges,
      alertNewsletter: userMongo.alertNewsletter,
      alertCategories: userMongo.alertCategories || []
    };

    res.json(preferences);
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateUserAlertPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      alertNewProducts, 
      alertRestock, 
      alertPriceChanges, 
      alertNewsletter, 
      alertCategories 
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await user.update({
      alertNewProducts: alertNewProducts !== undefined ? alertNewProducts : user.alertNewProducts,
      alertRestock: alertRestock !== undefined ? alertRestock : user.alertRestock,
      alertPriceChanges: alertPriceChanges !== undefined ? alertPriceChanges : user.alertPriceChanges,
      alertNewsletter: alertNewsletter !== undefined ? alertNewsletter : user.alertNewsletter,
      alertCategories: alertCategories !== undefined ? alertCategories : user.alertCategories
    });

    const userMongo = await UserMongo.findOne({ userId });
    if (userMongo) {
      await userMongo.updateOne({
        alertNewProducts: alertNewProducts !== undefined ? alertNewProducts : userMongo.alertNewProducts,
        alertRestock: alertRestock !== undefined ? alertRestock : userMongo.alertRestock,
        alertPriceChanges: alertPriceChanges !== undefined ? alertPriceChanges : userMongo.alertPriceChanges,
        alertNewsletter: alertNewsletter !== undefined ? alertNewsletter : userMongo.alertNewsletter,
        alertCategories: alertCategories !== undefined ? alertCategories : userMongo.alertCategories
      });
    }

    const updatedPreferences = {
      alertNewProducts: user.alertNewProducts,
      alertRestock: user.alertRestock,
      alertPriceChanges: user.alertPriceChanges,
      alertNewsletter: user.alertNewsletter,
      alertCategories: user.alertCategories
    };

    res.json({
      message: 'Préférences mises à jour avec succès',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAvailableCategories = async (req, res) => {
  try {
    const categories = await User.sequelize.query(
      'SELECT DISTINCT category FROM "Products" WHERE category IS NOT NULL ORDER BY category',
      { type: User.sequelize.QueryTypes.SELECT }
    );

    const categoryList = categories.map(cat => cat.category);
    res.json(categoryList);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getUserAlertHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    
    const whereClause = { userId };
    if (type && type.trim()) {
      whereClause.alertType = type.trim();
    }

    const alerts = await AlertHistory.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'category'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: (pageNum - 1) * limitNum
    });

    res.json({
      alerts: alerts.rows,
      totalCount: alerts.count,
      currentPage: pageNum,
      totalPages: Math.ceil(alerts.count / limitNum)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des alertes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const markAlertAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { alertId } = req.params;

    const alert = await AlertHistory.findOne({
      where: { id: alertId, userId }
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alerte non trouvée' });
    }

    await alert.update({ isRead: true });

    res.json({ message: 'Alerte marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'alerte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const markAllAlertsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await AlertHistory.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.json({ message: 'Toutes les alertes ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des alertes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getUnreadAlertsCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await AlertHistory.count({
      where: { userId, isRead: false }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Erreur lors du comptage des alertes non lues:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}; 