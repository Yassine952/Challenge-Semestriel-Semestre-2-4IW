// Utilisation de MongoDB pour les données du dashboard
const getPeriodFilter = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case '5m':
      startDate = new Date(now.getTime() - 5 * 60 * 1000);
      break;
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { createdAt: { $gte: startDate } };
};

const getPreviousPeriodFilter = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case '5m':
      endDate = new Date(now.getTime() - 5 * 60 * 1000);
      startDate = new Date(now.getTime() - 10 * 60 * 1000);
      break;
    case '1h':
      endDate = new Date(now.getTime() - 60 * 60 * 1000);
      startDate = new Date(now.getTime() - 120 * 60 * 1000);
      break;
    case '7d':
      endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      endDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      endDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      endDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      startDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
      break;
    default:
      endDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  }

  return { createdAt: { $gte: startDate, $lt: endDate } };
};

export const getStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const periodFilter = getPeriodFilter(period);
    const previousPeriodFilter = getPreviousPeriodFilter(period);

    // Import dynamique de MongoDB
    const { default: OrderMongo } = await import('../models/OrderMongo.js');
    const { default: User } = await import('../models/User.js');
    const { default: Product } = await import('../models/Product.js');

    console.log('Dashboard Stats - Period filter:', periodFilter);

    // Compter les commandes
    const totalOrders = await OrderMongo.countDocuments(periodFilter);
    const previousOrders = await OrderMongo.countDocuments(previousPeriodFilter);

    // Calculer le chiffre d'affaires (commandes terminées uniquement)
    const revenueFilter = { ...periodFilter, status: 'Completed' };
    const previousRevenueFilter = { ...previousPeriodFilter, status: 'Completed' };

    const revenueResult = await OrderMongo.aggregate([
      { $match: revenueFilter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const previousRevenueResult = await OrderMongo.aggregate([
      { $match: previousRevenueFilter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const previousRevenue = previousRevenueResult.length > 0 ? previousRevenueResult[0].total : 0;

    // Compter les utilisateurs (PostgreSQL) - Import Sequelize Op
    const { Op } = await import('sequelize');
    
    const totalUsers = await User.count({ 
      where: { 
        createdAt: { 
          [Op.gte]: periodFilter.createdAt.$gte 
        } 
      } 
    });
    const previousUsers = await User.count({ 
      where: { 
        createdAt: { 
          [Op.gte]: previousPeriodFilter.createdAt.$gte,
          [Op.lt]: previousPeriodFilter.createdAt.$lt 
        } 
      } 
    });

    // Compter les produits (PostgreSQL)
    const totalProducts = await Product.count();

    // Calculer les changements en pourcentage
    const ordersChange = previousOrders > 0 ? Math.round(((totalOrders - previousOrders) / previousOrders) * 100) : 0;
    const revenueChange = previousRevenue > 0 ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100) : 0;
    const usersChange = previousUsers > 0 ? Math.round(((totalUsers - previousUsers) / previousUsers) * 100) : 0;

    const result = {
      totalOrders,
      totalRevenue: Math.round((totalRevenue || 0) * 100) / 100,
      totalUsers,
      totalProducts,
      ordersChange,
      revenueChange,
      usersChange,
      productsChange: 0
    };

    console.log('Dashboard Stats - Final result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};

export const getOrdersOverTime = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const periodFilter = getPeriodFilter(period);

    const { default: OrderMongo } = await import('../models/OrderMongo.js');

    const orders = await OrderMongo.find(periodFilter, { createdAt: 1 }).sort({ createdAt: 1 });

    const groupedData = {};
    
    // Adapter la granularité selon la période
    orders.forEach(order => {
      let timeKey;
      if (period === '5m') {
        // Granularité par minute
        timeKey = order.createdAt.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
      } else if (period === '1h') {
        // Granularité par 5 minutes
        const date = new Date(order.createdAt);
        const minutes = Math.floor(date.getMinutes() / 5) * 5;
        date.setMinutes(minutes, 0, 0);
        timeKey = date.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
      } else {
        // Granularité par jour pour les autres périodes
        timeKey = order.createdAt.toISOString().split('T')[0];
      }
      
      groupedData[timeKey] = (groupedData[timeKey] || 0) + 1;
    });

    const labels = Object.keys(groupedData).sort();
    const data = labels.map(label => groupedData[label]);

    // Adapter le format des labels pour l'affichage
    const formattedLabels = labels.map(label => {
      if (period === '5m' || period === '1h') {
        // Format heure:minute
        return new Date(label).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        // Format date
        return new Date(label).toLocaleDateString('fr-FR');
      }
    });

    res.json({
      labels: formattedLabels,
      datasets: [{
        label: 'Commandes',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    });
  } catch (error) {
    console.error('Error fetching orders over time:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
  }
};

export const getRevenueOverTime = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const periodFilter = getPeriodFilter(period);

    const { default: OrderMongo } = await import('../models/OrderMongo.js');

    const orders = await OrderMongo.find(
      { ...periodFilter, status: 'Completed' },
      { createdAt: 1, totalAmount: 1 }
    ).sort({ createdAt: 1 });

    const groupedData = {};
    
    // Adapter la granularité selon la période
    orders.forEach(order => {
      let timeKey;
      if (period === '5m') {
        // Granularité par minute
        timeKey = order.createdAt.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
      } else if (period === '1h') {
        // Granularité par 5 minutes
        const date = new Date(order.createdAt);
        const minutes = Math.floor(date.getMinutes() / 5) * 5;
        date.setMinutes(minutes, 0, 0);
        timeKey = date.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
      } else {
        // Granularité par jour pour les autres périodes
        timeKey = order.createdAt.toISOString().split('T')[0];
      }
      
      groupedData[timeKey] = (groupedData[timeKey] || 0) + parseFloat(order.totalAmount);
    });

    const labels = Object.keys(groupedData).sort();
    const data = labels.map(label => Math.round(groupedData[label] * 100) / 100);

    // Adapter le format des labels pour l'affichage
    const formattedLabels = labels.map(label => {
      if (period === '5m' || period === '1h') {
        // Format heure:minute
        return new Date(label).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        // Format date
        return new Date(label).toLocaleDateString('fr-FR');
      }
    });

    res.json({
      labels: formattedLabels,
      datasets: [{
        label: 'Chiffre d\'affaires (€)',
        data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }]
    });
  } catch (error) {
    console.error('Error fetching revenue over time:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du chiffre d\'affaires' });
  }
};

export const getOrderStatusDistribution = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const periodFilter = getPeriodFilter(period);

    const { default: OrderMongo } = await import('../models/OrderMongo.js');

    const statusCounts = await OrderMongo.aggregate([
      { $match: periodFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const labels = statusCounts.map(item => {
      switch (item._id) {
        case 'Pending': return 'En attente';
        case 'Completed': return 'Terminée';
        case 'Cancelled': return 'Annulée';
        default: return item._id;
      }
    });
    
    const data = statusCounts.map(item => item.count);
    
    const colors = ['#f59e0b', '#10b981', '#ef4444', '#6b7280'];

    res.json({
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length),
        borderWidth: 1
      }]
    });
  } catch (error) {
    console.error('Error fetching order status distribution:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du statut des commandes' });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const { period = '30d', limit = 10 } = req.query;
    const periodFilter = getPeriodFilter(period);

    const { default: OrderMongo } = await import('../models/OrderMongo.js');

    const topProducts = await OrderMongo.aggregate([
      { $match: periodFilter },
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.productName', 
          totalQuantity: { $sum: '$items.quantity' } 
        } 
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const labels = topProducts.map(item => item._id);
    const data = topProducts.map(item => item.totalQuantity);

    res.json({
      labels,
      datasets: [{
        label: 'Quantité vendue',
        data,
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 1
      }]
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des top produits' });
  }
};

export const getRevenueByCategory = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const periodFilter = getPeriodFilter(period);

    const OrderMongo = (await import('../models/OrderMongo.js')).default;
    const ProductMongo = (await import('../models/ProductMongo.js')).default;

    console.log('getRevenueByCategory - Period filter:', periodFilter);

    // Récupérer les produits avec leurs catégories depuis MongoDB
    const products = await ProductMongo.find({}, { name: 1, category: 1 });

    console.log('getRevenueByCategory - Products found:', products.length);

    const productCategoryMap = {};
    products.forEach(product => {
      productCategoryMap[product.name] = product.category || 'Non catégorisé';
    });

    // Récupérer les revenus par produit depuis MongoDB
    const revenueByProduct = await OrderMongo.aggregate([
      { $match: { ...periodFilter, status: 'Completed' } },
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.productName', 
          totalRevenue: { $sum: '$items.price' } 
        } 
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    console.log('getRevenueByCategory - Revenue by product:', revenueByProduct);

    // Grouper par catégorie
    const categoryRevenue = {};
    revenueByProduct.forEach(item => {
      const category = productCategoryMap[item._id] || 'Non catégorisé';
      categoryRevenue[category] = (categoryRevenue[category] || 0) + item.totalRevenue;
    });

    const labels = Object.keys(categoryRevenue);
    const data = labels.map(label => Math.round(categoryRevenue[label] * 100) / 100);
    
    // Si pas de données, retourner des données par défaut
    if (labels.length === 0) {
      return res.json({
        labels: ['Aucune donnée'],
        datasets: [{
          data: [0],
          backgroundColor: ['#e5e7eb'],
          borderColor: ['#e5e7eb'],
          borderWidth: 1
        }]
      });
    }
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

    const result = {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length),
        borderWidth: 1
      }]
    };

    console.log('getRevenueByCategory - Final result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching revenue by category:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du CA par catégorie' });
  }
};

export const getUsersOverTime = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Import statique pour éviter les problèmes
    const User = (await import('../models/User.js')).default;
    const { Op } = await import('sequelize');
    
    // Calculer la date de début selon la période
    const now = new Date();
    let startDate;
    switch (period) {
      case '5m':
        startDate = new Date(now.getTime() - 5 * 60 * 1000);
        break;
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const users = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: ['createdAt'],
      order: [['createdAt', 'ASC']]
    });

    const groupedData = {};
    
    // Adapter la granularité selon la période
    users.forEach(user => {
      let timeKey;
      if (period === '5m') {
        // Granularité par minute
        timeKey = user.createdAt.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
      } else if (period === '1h') {
        // Granularité par 5 minutes
        const date = new Date(user.createdAt);
        const minutes = Math.floor(date.getMinutes() / 5) * 5;
        date.setMinutes(minutes, 0, 0);
        timeKey = date.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
      } else {
        // Granularité par jour pour les autres périodes
        timeKey = user.createdAt.toISOString().split('T')[0];
      }
      
      groupedData[timeKey] = (groupedData[timeKey] || 0) + 1;
    });

    const labels = Object.keys(groupedData).sort();
    const data = labels.map(label => groupedData[label]);

    // Adapter le format des labels pour l'affichage
    const formattedLabels = labels.map(label => {
      if (period === '5m' || period === '1h') {
        // Format heure:minute
        return new Date(label).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        // Format date
        return new Date(label).toLocaleDateString('fr-FR');
      }
    });

    res.json({
      labels: formattedLabels,
      datasets: [{
        label: 'Nouveaux utilisateurs',
        data,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      }]
    });
  } catch (error) {
    console.error('Error fetching users over time:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
}; 