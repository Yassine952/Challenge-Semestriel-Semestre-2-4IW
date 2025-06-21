import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import OrderMongo from '../models/OrderMongo.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtenir les statistiques financières
export const getFinancialStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log('📊 Calcul des statistiques comptables avec MongoDB');

    // Chiffre d'affaires total (commandes terminées uniquement comme dans le dashboard analytics)
    const revenueResult = await OrderMongo.aggregate([
      {
        $match: {
          status: 'Completed'  // Même filtre que dans dashboardController
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Total factures (commandes non annulées)
    const totalInvoices = await OrderMongo.countDocuments({
      status: { $ne: 'CANCELLED' }
    });

    // Factures ce mois (commandes non annulées)
    const invoicesThisMonth = await OrderMongo.countDocuments({
      status: { $ne: 'CANCELLED' },
      createdAt: { $gte: startOfMonth }
    });

    console.log(`💰 CA calculé: ${totalRevenue}€, Factures: ${totalInvoices}, Ce mois: ${invoicesThisMonth}`);

    res.json({
      totalRevenue: Math.round((totalRevenue || 0) * 100) / 100, // Arrondi comme dans dashboardController
      totalInvoices,
      invoicesThisMonth
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques financières:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des statistiques financières',
      error: error.message 
    });
  }
};

// Extraire les factures selon les filtres
export const extractInvoices = async (req, res) => {
  try {
    const { startDate, endDate, format } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
    }

    console.log(`📊 Extraction des factures MongoDB du ${startDate} au ${endDate}`);

    // Construction des filtres MongoDB
    const filter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate + ' 23:59:59')
      }
    };

    // Récupération des commandes MongoDB
    const orders = await OrderMongo.find(filter)
      .sort({ createdAt: -1 });

    console.log(`📋 ${orders.length} commandes trouvées`);

    // Calcul du montant total
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Si aucune commande trouvée, retourner un résumé avec count = 0
    if (orders.length === 0) {
      console.log('⚠️  Aucune commande trouvée dans la période');
      return res.json({
        success: true,
        message: 'Aucune facture trouvée dans la période spécifiée',
        summary: {
          period: `${startDate} - ${endDate}`,
          count: 0,
          totalAmount: 0,
          format,
          fileName: null,
          downloadUrl: null
        }
      });
    }

    // Génération du fichier selon le format
    let filePath;
    let fileName;

    switch (format) {
      case 'csv':
        fileName = `factures_${startDate}_${endDate}.csv`;
        filePath = await generateCSVMongo(orders, fileName);
        break;
      default:
        return res.status(400).json({ message: 'Format non supporté' });
    }

    res.json({
      success: true,
      message: 'Extraction terminée avec succès',
      summary: {
        period: `${startDate} - ${endDate}`,
        count: orders.length,
        totalAmount,
        format,
        fileName,
        downloadUrl: `/compta/download/${fileName}`
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'extraction des factures:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'extraction des factures',
      error: error.message 
    });
  }
};

// Générer un fichier CSV pour MongoDB
const generateCSVMongo = async (orders, fileName) => {
  const csvContent = [
    // En-tête
    'ID Commande,Date,Statut,Montant Total,Détails Produits,Adresse Livraison'
  ];

  orders.forEach(order => {
    const products = order.items?.map(item => 
      `${item.productId} (x${item.quantity}) - ${item.price.toFixed(2)}€`
    ).join(' | ') || 'Aucun produit';

    const address = order.shippingAddress ? 
      `${order.shippingAddress.street}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode}` : 
      'Adresse non renseignée';

    csvContent.push([
      order._id,
      new Date(order.createdAt).toLocaleDateString('fr-FR'),
      order.status,
      `${order.totalAmount.toFixed(2)}€`,
      `"${products}"`,
      `"${address}"`
    ].join(','));
  });

  const filePath = path.join(__dirname, '../../invoices', fileName);
  
  // Créer le dossier s'il n'existe pas
  const invoicesDir = path.dirname(filePath);
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  fs.writeFileSync(filePath, csvContent.join('\n'), 'utf8');
  return filePath;
};

// Générer un fichier CSV (ancienne version PostgreSQL - gardée pour compatibilité)
const generateCSV = async (orders, fileName) => {
  const csvContent = [
    // En-tête
    'ID Commande,Date,Client,Email,Statut,Montant Total,Détails Produits'
  ];

  orders.forEach(order => {
    const products = order.OrderItems?.map(item => 
      `${item.productName} (x${item.quantity}) - ${item.price.toFixed(2)}€`
    ).join(' | ') || 'Aucun produit';

    csvContent.push([
      order.id,
      new Date(order.createdAt).toLocaleDateString('fr-FR'),
      `${order.User.firstName} ${order.User.lastName}`,
      order.User.email,
      order.status,
      `${order.totalAmount.toFixed(2)}€`,
      `"${products}"`
    ].join(','));
  });

  const filePath = path.join(__dirname, '../../invoices', fileName);
  
  // Créer le dossier s'il n'existe pas
  const invoicesDir = path.dirname(filePath);
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  fs.writeFileSync(filePath, csvContent.join('\n'), 'utf8');
  return filePath;
};

// Générer un fichier Excel (simulation - en réalité il faudrait une lib comme xlsx)
const generateExcel = async (orders, fileName) => {
  // Pour l'instant, on génère un CSV avec extension xlsx
  // Dans un vrai projet, utiliser une bibliothèque comme 'xlsx'
  const filePath = path.join(__dirname, '../../invoices', fileName);
  
  const invoicesDir = path.dirname(filePath);
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const content = `Rapport des Factures\n\nNombre de factures: ${orders.length}\nMontant total: ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}€\n\nDétails:\n${orders.map(order => `${order.id} - ${order.totalAmount.toFixed(2)}€ - ${order.status}`).join('\n')}`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
};

// Générer un fichier PDF (simulation)
const generatePDF = async (orders, fileName) => {
  // Pour l'instant, on génère un fichier texte avec extension pdf
  // Dans un vrai projet, utiliser une bibliothèque comme 'puppeteer' ou 'jsPDF'
  const filePath = path.join(__dirname, '../../invoices', fileName);
  
  const invoicesDir = path.dirname(filePath);
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const content = `RAPPORT DES FACTURES\n\nNombre de factures: ${orders.length}\nMontant total: ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}€\n\nDétails:\n${orders.map(order => `Commande ${order.id} - ${order.totalAmount.toFixed(2)}€ - ${order.status}`).join('\n')}`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
};

// Télécharger un fichier généré
export const downloadFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../../invoices', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement:', err);
        res.status(500).json({ message: 'Erreur lors du téléchargement' });
      }
    });

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({ 
      message: 'Erreur lors du téléchargement',
      error: error.message 
    });
  }
};

// Générer un rapport financier
export const generateFinancialReport = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Données du mois en cours
    const monthlyOrders = await Order.findAll({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        },
        status: {
          [Op.ne]: 'CANCELLED'
        }
      },
      include: [
        {
          model: User,
          attributes: ['email', 'firstName', 'lastName']
        }
      ]
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const reportData = {
      period: `${startOfMonth.toLocaleDateString('fr-FR')} - ${now.toLocaleDateString('fr-FR')}`,
      totalOrders: monthlyOrders.length,
      totalRevenue: monthlyRevenue,
      averageOrderValue: monthlyOrders.length > 0 ? Math.round(monthlyRevenue / monthlyOrders.length) : 0,
      orders: monthlyOrders.map(order => ({
        id: order.id,
        date: order.createdAt,
        customer: `${order.User.firstName} ${order.User.lastName}`,
        email: order.User.email,
        amount: order.totalAmount,
        status: order.status
      }))
    };

    const fileName = `rapport_financier_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}.json`;
    const filePath = path.join(__dirname, '../../invoices', fileName);
    
    const invoicesDir = path.dirname(filePath);
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2), 'utf8');

    res.json({
      success: true,
      message: 'Rapport financier généré avec succès',
      fileName,
      downloadUrl: `/compta/download/${fileName}`,
      summary: {
        period: reportData.period,
        totalOrders: reportData.totalOrders,
        totalRevenue: reportData.totalRevenue,
        averageOrderValue: reportData.averageOrderValue
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération du rapport financier:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la génération du rapport financier',
      error: error.message 
    });
  }
}; 