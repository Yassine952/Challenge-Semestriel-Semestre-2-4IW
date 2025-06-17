import nodemailer from 'nodemailer';
import Product from '../models/Product.js';
import User from '../models/User.js';
import AlertHistory from '../models/AlertHistory.js';
import { Op } from 'sequelize';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const LOW_STOCK_THRESHOLD = 10;

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

export const sendNewProductAlert = async (product) => {
  try {

    const users = await User.findAll({
      where: { 
        role: 'ROLE_USER',
        alertNewProducts: true
      }
    });

    console.log(`Utilisateurs trouvés: ${users.length}`);
    users.forEach(u => console.log(`- ${u.email}, categories: ${JSON.stringify(u.alertCategories)}`));

    const filteredUsers = users.filter(user => {

      const categories = user.alertCategories;
      console.log(`User ${user.email}: categories=${JSON.stringify(categories)}, product.category=${product.category}`);
      
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        console.log(`  -> Accepté (pas de préférence)`);
        return true;
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
                  ${product.price}€
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

export const sendLowStockAlert = async (product) => {
  try {

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
                  Prix: ${product.price}€
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

export const checkLowStock = async (req, res) => {
  try {

    const threshold = req.query.threshold ? parseInt(req.query.threshold) : LOW_STOCK_THRESHOLD;
    
    const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [Op.lte]: threshold
        }
      }
    });

    const alertPromises = lowStockProducts.map(product => sendLowStockAlert(product));
    await Promise.all(alertPromises);

    res.json({
      message: `Vérification terminée. ${lowStockProducts.length} produits en stock faible.`,
      lowStockProducts: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des stocks:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification des stocks' });
  }
};

export const sendPriceChangeAlert = async (product, oldPrice, newPrice) => {
  try {

    const users = await User.findAll({
      where: { 
        role: 'ROLE_USER',
        alertPriceChanges: true
      }
    });

    const filteredUsers = users.filter(user => {
      if (!user.alertCategories || user.alertCategories.length === 0) {
        return true;
      }
      return user.alertCategories.includes(product.category);
    });

    const priceChange = newPrice - oldPrice;
    const isIncrease = priceChange > 0;
    const changePercent = Math.abs((priceChange / oldPrice) * 100).toFixed(1);

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
                  <span style="color: #6b7280; text-decoration: line-through;">Ancien prix: ${oldPrice}€</span>
                </div>
                <div>
                  <span style="background: ${isIncrease ? '#dc2626' : '#059669'}; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;">
                    Nouveau prix: ${newPrice}€
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

    const historyPromises = filteredUsers.map(user => 
      saveAlertHistory(
        user.id, 
        product.id, 
        'price_change', 
        `💰 ${isIncrease ? 'Augmentation' : 'Baisse'} de prix - ${product.name}`,
        `Le prix du produit "${product.name}" est passé de ${oldPrice}€ à ${newPrice}€ (${isIncrease ? '+' : '-'}${changePercent}%).`,
        { productName: product.name, oldPrice, newPrice, changePercent, isIncrease }
      )
    );
    await Promise.all(historyPromises);
    
    console.log(`Alertes changement de prix envoyées à ${filteredUsers.length} utilisateurs`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des alertes changement de prix:', error);
  }
};

export const sendNewsletter = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Liste des produits requise' });
    }

    const products = await Product.findAll({
      where: { id: productIds }
    });

    const users = await User.findAll({
      where: { 
        role: 'ROLE_USER',
        alertNewsletter: true
      }
    });

    const emailPromises = users.map(user => {
      const productsHtml = products.map(product => `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0;">
          <h4 style="color: #1f2937; margin: 0 0 10px 0;">${product.name}</h4>
          <p style="color: #6b7280; margin: 0 0 10px 0;">${product.description}</p>
          <div>
            <span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
              ${product.price}€
            </span>
            <span style="margin-left: 10px; color: #059669; font-size: 14px;">
              ${product.stock} en stock
            </span>
          </div>
        </div>
      `).join('');

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: '📧 Newsletter - Nouveaux produits',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">📧 Newsletter - Nouveaux produits</h2>
            <p style="color: #6b7280;">Découvrez nos derniers produits :</p>
            ${productsHtml}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Voir tous les produits
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Vous recevez cet email car vous êtes inscrit à notre newsletter.
              <br>
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

    const historyPromises = users.map(user => 
      saveAlertHistory(
        user.id, 
        null,
        'newsletter', 
        '📧 Newsletter - Nouveaux produits',
        `Newsletter contenant ${products.length} produit(s).`,
        { productsCount: products.length, productNames: products.map(p => p.name) }
      )
    );
    await Promise.all(historyPromises);

    res.json({
      message: `Newsletter envoyée à ${users.length} utilisateurs`,
      productsCount: products.length
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la newsletter:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la newsletter' });
  }
};

export const sendRestockAlert = async (product) => {
  try {

    const users = await User.findAll({
      where: { 
        role: 'ROLE_USER',
        alertRestock: true
      }
    });

    const filteredUsers = users.filter(user => {
      if (!user.alertCategories || user.alertCategories.length === 0) {
        return true;
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
                  ${product.price}€
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

export { LOW_STOCK_THRESHOLD }; 