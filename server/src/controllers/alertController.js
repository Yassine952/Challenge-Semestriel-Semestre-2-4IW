import nodemailer from 'nodemailer';
import Product from '../models/Product.js';
import User from '../models/User.js';
import AlertHistory from '../models/AlertHistory.js';
import { Op } from 'sequelize';
import ProductMongo from '../models/ProductMongo.js';
import ConfigService from '../services/configService.js';
import mongoose from 'mongoose';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fonction utilitaire pour enregistrer l'historique des alertes
const saveAlertHistory = async (userId, productId, alertType, title, message, metadata = null) => {
  try {
    await AlertHistory.create({
      userId,
      productId,
      alertType,
      title,
      message,
      emailSent: true,
      metadata
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'historique d\'alerte:', error);
  }
};

// Envoyer une alerte de nouveau produit
export const sendNewProductAlert = async (product) => {
  try {
    // Récupérer tous les utilisateurs qui souhaitent recevoir des alertes de nouveaux produits
    const users = await User.findAll({
      where: { 
        role: 'ROLE_USER',
        alertNewProducts: true
      }
    });

    console.log(`Utilisateurs trouvés: ${users.length}`);
    users.forEach(u => console.log(`- ${u.email}, categories: ${JSON.stringify(u.alertCategories)}`));

    // Filtrer par catégorie si l'utilisateur a des préférences spécifiques
    const filteredUsers = users.filter(user => {
      // Vérifier si alertCategories est null, undefined, ou tableau vide
      const categories = user.alertCategories;
      console.log(`User ${user.email}: categories=${JSON.stringify(categories)}, product.category=${product.category}`);
      
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        console.log(`  -> Accepté (pas de préférence)`);
        return true; // Pas de préférence = toutes les catégories
      }
      
      const accepted = categories.includes(product.category);
      console.log(`  -> ${accepted ? 'Accepté' : 'Rejeté'} (catégorie ${accepted ? 'trouvée' : 'non trouvée'})`);
      return accepted;
    });

    console.log(`Utilisateurs filtrés: ${filteredUsers.length}`);

    const emailPromises = filteredUsers.map(user => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: '🆕 Nouveau produit disponible !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Nouveau produit disponible !</h2>
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1f2937;">${product.name}</h3>
              <p style="color: #6b7280;">${product.description}</p>
              <div style="margin: 15px 0;">
                <span style="background: #3b82f6; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;">
                  ${(product.price / 100).toFixed(2)}€
                </span>
                <span style="margin-left: 10px; color: #059669;">
                  Stock: ${product.stock} disponibles
                </span>
              </div>
              <div style="margin: 15px 0;">
                <span style="background: #f3f4f6; color: #374151; padding: 3px 8px; border-radius: 12px; font-size: 12px;">
                  ${product.category}
                </span>
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Connectez-vous à votre compte pour découvrir ce nouveau produit !
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Voir le produit
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" style="color: #9ca3af;">
                Gérer mes préférences d'alertes
              </a>
            </p>
          </div>
        `
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    
    // Enregistrer l'historique pour chaque utilisateur
    const historyPromises = filteredUsers.map(user => 
      saveAlertHistory(
        user.id, 
        product.id, 
        'new_product', 
        '🆕 Nouveau produit disponible !',
        `Le produit "${product.name}" est maintenant disponible dans la catégorie ${product.category}.`,
        { productName: product.name, category: product.category, price: product.price }
      )
    );
    await Promise.all(historyPromises);
    
    console.log(`Alertes nouveau produit envoyées à ${filteredUsers.length} utilisateurs`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des alertes nouveau produit:', error);
  }
};

// Envoyer une alerte de stock faible
export const sendLowStockAlert = async (product) => {
  try {
    // Récupérer les administrateurs et gestionnaires de stock
    const admins = await User.findAll({
      where: { 
        role: ['ROLE_ADMIN', 'ROLE_STORE_KEEPER'] 
      }
    });

    const emailPromises = admins.map(admin => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: admin.email,
        subject: '⚠️ Alerte stock faible',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ Alerte stock faible</h2>
            <div style="border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; background: #fef2f2;">
              <h3 style="color: #991b1b;">${product.name}</h3>
              <p style="color: #7f1d1d;">Le stock de ce produit est faible et nécessite un réapprovisionnement.</p>
              <div style="margin: 15px 0;">
                <span style="background: #dc2626; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;">
                  Stock restant: ${product.stock}
                </span>
                <span style="margin-left: 10px; color: #374151;">
                  Prix: ${(product.price / 100).toFixed(2)}€
                </span>
              </div>
              <div style="margin: 15px 0;">
                <span style="background: #f3f4f6; color: #374151; padding: 3px 8px; border-radius: 12px; font-size: 12px;">
                  ${product.category}
                </span>
              </div>
            </div>
            <p style="color: #7f1d1d; font-weight: bold;">
              Action requise: Veuillez réapprovisionner ce produit dès que possible.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/edit-product/${product.id}" 
                 style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Gérer le stock
              </a>
            </div>
          </div>
        `
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    console.log(`Alertes stock faible envoyées à ${admins.length} administrateurs`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des alertes stock faible:', error);
  }
};

// Vérifier les stocks faibles (à exécuter périodiquement)
export const checkLowStock = async (req, res) => {
  try {
    // Récupérer le seuil depuis la base de données ou utiliser la valeur par défaut
    const threshold = req.query.threshold ? 
      parseInt(req.query.threshold) : 
      await ConfigService.get('low_stock_threshold', 10);

    console.log(`🔍 Vérification des stocks faibles avec seuil: ${threshold}`);

    // 🔧 CORRECTION: Utiliser MongoDB pour récupérer les produits (selon cahier des charges)
    const lowStockProducts = await ProductMongo.find({
      stock: { $lte: threshold }
    });

    // Envoyer une alerte pour chaque produit en stock faible
    const alertPromises = lowStockProducts.map(product => sendLowStockAlert(product));
    await Promise.all(alertPromises);

    res.json({
      message: `Vérification terminée. ${lowStockProducts.length} produits en stock faible.`,
      lowStockProducts: lowStockProducts.map(p => ({
        id: p.productId,
        name: p.name,
        stock: p.stock
      })),
      threshold
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des stocks:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification des stocks' });
  }
};

// Envoyer une alerte de changement de prix
export const sendPriceChangeAlert = async (product, oldPrice, newPrice) => {
  try {
    // Récupérer les utilisateurs intéressés par les changements de prix
    const users = await User.findAll({
      where: { 
        role: 'ROLE_USER',
        alertPriceChanges: true
      }
    });

    // Filtrer par catégorie si l'utilisateur a des préférences spécifiques
    const filteredUsers = users.filter(user => {
      if (!user.alertCategories || user.alertCategories.length === 0) {
        return true; // Pas de préférence = toutes les catégories
      }
      return user.alertCategories.includes(product.category);
    });

    const priceChange = newPrice - oldPrice;
    const isIncrease = priceChange > 0;
    const changePercent = Math.abs((priceChange / oldPrice) * 100).toFixed(1);

    // Convertir les prix de centimes en euros pour l'affichage
    const oldPriceEuros = (oldPrice / 100).toFixed(2);
    const newPriceEuros = (newPrice / 100).toFixed(2);

    const emailPromises = filteredUsers.map(user => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `💰 ${isIncrease ? 'Augmentation' : 'Baisse'} de prix - ${product.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${isIncrease ? '#dc2626' : '#059669'};">
              💰 ${isIncrease ? 'Augmentation' : 'Baisse'} de prix
            </h2>
            <div style="border: 1px solid ${isIncrease ? '#fecaca' : '#d1fae5'}; border-radius: 8px; padding: 20px; margin: 20px 0; background: ${isIncrease ? '#fef2f2' : '#f0fdf4'};">
              <h3 style="color: #1f2937;">${product.name}</h3>
              <p style="color: #6b7280;">${product.description}</p>
              <div style="margin: 15px 0;">
                <div style="margin-bottom: 10px;">
                  <span style="color: #6b7280; text-decoration: line-through;">Ancien prix: ${oldPriceEuros}€</span>
                </div>
                <div>
                  <span style="background: ${isIncrease ? '#dc2626' : '#059669'}; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;">
                    Nouveau prix: ${newPriceEuros}€
                  </span>
                  <span style="margin-left: 10px; color: ${isIncrease ? '#dc2626' : '#059669'}; font-weight: bold;">
                    ${isIncrease ? '+' : '-'}${changePercent}%
                  </span>
                </div>
              </div>
              <div style="margin: 15px 0;">
                <span style="background: #f3f4f6; color: #374151; padding: 3px 8px; border-radius: 12px; font-size: 12px;">
                  ${product.category}
                </span>
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
                 style="background: ${isIncrease ? '#dc2626' : '#059669'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${isIncrease ? 'Voir le produit' : 'Profiter de la baisse !'}
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" style="color: #9ca3af;">
                Gérer mes préférences d'alertes
              </a>
            </p>
          </div>
        `
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    
    // Enregistrer l'historique pour chaque utilisateur avec les prix en euros
    const historyPromises = filteredUsers.map(user => 
      saveAlertHistory(
        user.id, 
        product.id, 
        'price_change', 
        `💰 ${isIncrease ? 'Augmentation' : 'Baisse'} de prix - ${product.name}`,
        `Le prix du produit "${product.name}" est passé de ${oldPriceEuros}€ à ${newPriceEuros}€ (${isIncrease ? '+' : '-'}${changePercent}%).`,
        { productName: product.name, oldPrice: oldPriceEuros, newPrice: newPriceEuros, changePercent, isIncrease }
      )
    );
    await Promise.all(historyPromises);
    
    console.log(`Alertes changement de prix envoyées à ${filteredUsers.length} utilisateurs`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des alertes changement de prix:', error);
  }
};

// Envoyer une newsletter avec les nouveaux produits
export const sendNewsletter = async (req, res) => {
  try {
    const { 
      productIds, 
      title = '📧 Newsletter - Nouveaux produits',
      message = 'Découvrez nos derniers produits :',
      buttonText = 'Voir tous les produits',
      backgroundColor = '#3b82f6',
      textColor = '#ffffff'
    } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Liste des produits requise' });
    }

    if (!title.trim()) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    console.log('📧 Envoi newsletter avec IDs:', productIds);

    // Essayer d'abord avec les IDs PostgreSQL
    let products = await Product.findAll({
      where: { id: productIds }
    });

    // Si aucun produit trouvé, essayer avec les productId (pour le cas où les IDs seraient des ObjectId MongoDB)
    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé avec les IDs PostgreSQL, tentative avec productId...');
      
      // Convertir les IDs MongoDB en productId PostgreSQL
      const mongoProducts = await ProductMongo.find({
        _id: { $in: productIds.map(id => {
          try {
            return new mongoose.Types.ObjectId(id);
          } catch (e) {
            return null;
          }
        }).filter(Boolean) }
      });
      
      if (mongoProducts.length > 0) {
        const postgresIds = mongoProducts.map(p => p.productId);
        console.log('✅ Produits MongoDB trouvés, recherche PostgreSQL avec productIds:', postgresIds);
        
        products = await Product.findAll({
          where: { id: postgresIds }
        });
      }
    }

    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé avec les IDs fournis:', productIds);
      return res.status(400).json({ error: 'Aucun produit trouvé avec ces IDs' });
    }

    console.log(`✅ ${products.length} produit(s) trouvé(s) pour l'envoi newsletter`);

    const users = await User.findAll({
      where: { 
        role: 'ROLE_USER',
        alertNewsletter: true
      }
    });

    const emailPromises = users.map(user => {
      const productsHtml = products.map(product => `
        <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 15px 0; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: transform 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <h3 style="color: #1f2937; margin: 0; font-size: 18px; font-weight: 600;">${product.name}</h3>
            <span style="background: ${backgroundColor}; color: ${textColor}; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 16px; white-space: nowrap; margin-left: 15px;">
              ${(product.price / 100).toFixed(2)}€
            </span>
          </div>
          <p style="color: #6b7280; margin: 0 0 15px 0; line-height: 1.5;">${product.description}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center;">
              <span style="background: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 15px; font-size: 12px; text-transform: uppercase; font-weight: 500;">
                ${product.category}
              </span>
            </div>
            <div style="color: #059669; font-size: 14px; font-weight: 500;">
              📦 ${product.stock} disponible${product.stock > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      `).join('');

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <!-- Header avec couleur personnalisable -->
            <div style="background: ${backgroundColor}; padding: 30px 20px; text-align: center;">
              <h1 style="color: ${textColor}; margin: 0; font-size: 24px; font-weight: bold;">${title}</h1>
            </div>
            
            <!-- Contenu principal -->
            <div style="padding: 30px 20px;">
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">${message}</p>
              
              <!-- Produits -->
              <div style="margin: 25px 0;">
                ${productsHtml}
              </div>
              
              <!-- Bouton d'action -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
                   style="background: ${backgroundColor}; color: ${textColor}; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                  ${buttonText}
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Vous recevez cet email car vous êtes inscrit à notre newsletter.
              </p>
              <p style="margin: 8px 0 0 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" 
                   style="color: #6b7280; font-size: 12px; text-decoration: underline;">
                  Gérer mes préférences d'alertes
                </a>
              </p>
            </div>
          </div>
        `
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    // Enregistrer l'historique pour chaque utilisateur
    const historyPromises = users.map(user => 
      saveAlertHistory(
        user.id, 
        null, // Pas de produit spécifique pour la newsletter
        'newsletter', 
        title,
        `Newsletter personnalisée contenant ${products.length} produit(s).`,
        { 
          productsCount: products.length, 
          productNames: products.map(p => p.name),
          customTitle: title,
          customMessage: message,
          backgroundColor,
          textColor
        }
      )
    );
    await Promise.all(historyPromises);

    res.json({
      message: `Newsletter envoyée à ${users.length} utilisateurs`,
      productsCount: products.length,
      title: title,
      customization: {
        backgroundColor,
        textColor,
        buttonText
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la newsletter:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la newsletter' });
  }
};

// Envoyer alerte de restock (produit de nouveau disponible)
export const sendRestockAlert = async (product) => {
  try {
    // Récupérer les utilisateurs intéressés par les alertes de restock
    const users = await User.findAll({
      where: { 
        role: 'ROLE_USER',
        alertRestock: true
      }
    });

    // Filtrer par catégorie si l'utilisateur a des préférences spécifiques
    const filteredUsers = users.filter(user => {
      if (!user.alertCategories || user.alertCategories.length === 0) {
        return true; // Pas de préférence = toutes les catégories
      }
      return user.alertCategories.includes(product.category);
    });

    const emailPromises = filteredUsers.map(user => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: '🔄 Produit de nouveau disponible !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">🔄 Produit de nouveau disponible !</h2>
            <div style="border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0; background: #f0fdf4;">
              <h3 style="color: #065f46;">${product.name}</h3>
              <p style="color: #047857;">Ce produit a été réapprovisionné et est de nouveau disponible !</p>
              <div style="margin: 15px 0;">
                <span style="background: #059669; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;">
                  ${(product.price / 100).toFixed(2)}€
                </span>
                <span style="margin-left: 10px; color: #047857;">
                  ✅ En stock
                </span>
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
                 style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Commander maintenant
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" style="color: #9ca3af;">
                Gérer mes préférences d'alertes
              </a>
            </p>
          </div>
        `
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    
    // Enregistrer l'historique pour chaque utilisateur
    const historyPromises = filteredUsers.map(user => 
      saveAlertHistory(
        user.id, 
        product.id, 
        'restock', 
        '🔄 Produit de nouveau disponible !',
        `Le produit "${product.name}" a été réapprovisionné et est de nouveau disponible.`,
        { productName: product.name }
      )
    );
    await Promise.all(historyPromises);
    
    console.log(`Alertes restock envoyées à ${filteredUsers.length} utilisateurs`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des alertes restock:', error);
  }
};

// ✅ NOUVELLES FONCTIONS DE CONFIGURATION
// Mettre à jour le seuil de stock faible
export const updateStockThreshold = async (req, res) => {
  try {
    const { threshold } = req.body;
    
    if (!threshold || threshold < 1) {
      return res.status(400).json({ error: 'Seuil invalide (doit être >= 1)' });
    }
    
    const success = await ConfigService.set(
      'low_stock_threshold', 
      parseInt(threshold), 
      'number', 
      'Seuil de stock critique en dessous duquel une alerte est envoyée'
    );
    
    if (!success) {
      return res.status(500).json({ error: 'Erreur lors de la sauvegarde du seuil' });
    }
    
    console.log(`✅ Seuil de stock faible mis à jour: ${threshold}`);
    
    res.json({ 
      message: `Seuil de stock faible mis à jour: ${threshold}`,
      threshold: parseInt(threshold)
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du seuil:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du seuil' });
  }
};

// Récupérer le seuil actuel
export const getStockThreshold = async (req, res) => {
  try {
    const threshold = await ConfigService.get('low_stock_threshold', 10);
    res.json({ threshold });
  } catch (error) {
    console.error('Erreur lors de la récupération du seuil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du seuil' });
  }
};

// Prévisualiser une newsletter avant envoi
export const previewNewsletter = async (req, res) => {
  try {
    const { 
      productIds, 
      title = '📧 Newsletter - Nouveaux produits',
      message = 'Découvrez nos derniers produits :',
      buttonText = 'Voir tous les produits',
      backgroundColor = '#3b82f6',
      textColor = '#ffffff'
    } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Liste des produits requise' });
    }

    console.log('🔍 Recherche produits pour newsletter avec IDs:', productIds);

    // Essayer d'abord avec les IDs PostgreSQL
    let products = await Product.findAll({
      where: { id: productIds }
    });

    // Si aucun produit trouvé, essayer avec les productId (pour le cas où les IDs seraient des ObjectId MongoDB)
    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé avec les IDs PostgreSQL, tentative avec productId...');
      
      // Convertir les IDs MongoDB en productId PostgreSQL
      const mongoProducts = await ProductMongo.find({
        _id: { $in: productIds.map(id => {
          try {
            return new mongoose.Types.ObjectId(id);
          } catch (e) {
            return null;
          }
        }).filter(Boolean) }
      });
      
      if (mongoProducts.length > 0) {
        const postgresIds = mongoProducts.map(p => p.productId);
        console.log('✅ Produits MongoDB trouvés, recherche PostgreSQL avec productIds:', postgresIds);
        
        products = await Product.findAll({
          where: { id: postgresIds }
        });
      }
    }

    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé avec les IDs fournis:', productIds);
      return res.status(404).json({ error: 'Aucun produit trouvé avec ces IDs' });
    }

    console.log(`✅ ${products.length} produit(s) trouvé(s) pour la newsletter`);

    // Compter les utilisateurs qui recevraient la newsletter
    const userCount = await User.count({
      where: { 
        role: 'ROLE_USER',
        alertNewsletter: true
      }
    });

    // Générer le HTML de prévisualisation
    const productsHtml = products.map(product => `
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 15px 0; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <h3 style="color: #1f2937; margin: 0; font-size: 18px; font-weight: 600;">${product.name}</h3>
          <span style="background: ${backgroundColor}; color: ${textColor}; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 16px;">
            ${(product.price / 100).toFixed(2)}€
          </span>
        </div>
        <p style="color: #6b7280; margin: 0 0 15px 0; line-height: 1.5;">${product.description}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="background: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 15px; font-size: 12px; text-transform: uppercase; font-weight: 500;">
            ${product.category}
          </span>
          <div style="color: #059669; font-size: 14px; font-weight: 500;">
            📦 ${product.stock} disponible${product.stock > 1 ? 's' : ''}
          </div>
        </div>
      </div>
    `).join('');

    const previewHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: ${backgroundColor}; padding: 30px 20px; text-align: center;">
          <h1 style="color: ${textColor}; margin: 0; font-size: 24px; font-weight: bold;">${title}</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">${message}</p>
          
          <div style="margin: 25px 0;">
            ${productsHtml}
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
               style="background: ${backgroundColor}; color: ${textColor}; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
              ${buttonText}
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Vous recevez cet email car vous êtes inscrit à notre newsletter.
          </p>
          <p style="margin: 8px 0 0 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" 
               style="color: #6b7280; font-size: 12px; text-decoration: underline;">
              Gérer mes préférences d'alertes
            </a>
          </p>
        </div>
      </div>
    `;

    res.json({
      previewHtml,
      recipientCount: userCount,
      productsCount: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        stock: p.stock
      })),
      settings: {
        title,
        message,
        buttonText,
        backgroundColor,
        textColor
      }
    });
  } catch (error) {
    console.error('Erreur lors de la prévisualisation de la newsletter:', error);
    res.status(500).json({ error: 'Erreur lors de la prévisualisation de la newsletter' });
  }
};

// ✅ FONCTION AMÉLIORÉE - Vérifier automatiquement un produit spécifique
export const checkProductStockThreshold = async (product, oldStock = null) => {
  try {
    const currentStock = product.stock;
    const threshold = await ConfigService.get('low_stock_threshold', 10);
    
    // Si le stock actuel est <= au seuil ET différent de l'ancien stock
    if (currentStock <= threshold && currentStock > 0) {
      // Si on a un ancien stock, vérifier qu'on vient de passer sous le seuil
      if (oldStock === null || oldStock > threshold) {
        console.log(`🚨 ALERTE: Produit ${product.name} (ID: ${product.id}) - Stock: ${currentStock} <= Seuil: ${threshold}`);
        
        // Envoyer l'alerte
        await sendLowStockAlert(product);
        
        return true; // Alerte envoyée
      }
    }
    
    return false; // Pas d'alerte nécessaire
  } catch (error) {
    console.error('Erreur lors de la vérification du seuil de stock:', error);
    return false;
  }
};

// ✅ FONCTION DE TEST - Tester l'alerte de stock faible pour un produit spécifique
export const testLowStockAlert = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ error: 'ID du produit requis' });
    }

    // Import dynamique pour éviter les dépendances circulaires
    const { default: Product } = await import('../models/Product.js');
    
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const threshold = await ConfigService.get('low_stock_threshold', 10);

    console.log(`🧪 TEST: Envoi alerte stock faible pour ${product.name} (stock: ${product.stock})`);
    
    // Forcer l'envoi de l'alerte (même si le stock n'est pas forcément faible)
    await sendLowStockAlert(product);
    
    res.json({
      message: `Alerte de stock faible envoyée pour le produit "${product.name}"`,
      product: {
        id: product.id,
        name: product.name,
        stock: product.stock,
        threshold
      }
    });
  } catch (error) {
    console.error('Erreur lors du test d\'alerte:', error);
    res.status(500).json({ error: 'Erreur lors du test d\'alerte' });
  }
}; 