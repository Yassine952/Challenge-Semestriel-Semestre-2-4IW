import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import ProductMongo from '../models/ProductMongo.js';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import StockSyncService from '../services/stockSyncService.js';
import { updateProductStockRelative } from '../services/hybridStockService.js';
import { Op } from 'sequelize';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateInvoicePDF = async (order, user) => {
  const doc = new PDFDocument();
  const invoiceDir = path.join(__dirname, '../../invoices');

  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir);
  }

  const pdfPath = path.join(invoiceDir, `invoice_${order.id}.pdf`);
  doc.pipe(fs.createWriteStream(pdfPath));

  // En-tête
  doc.fontSize(25).text('Facture', { align: 'center' });
  doc.moveDown();
  
  // Informations de commande
  doc.fontSize(16).text(`Numéro de commande: ${order.id}`);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`);
  doc.text(`Nom: ${order.userName}`);
  doc.text(`Adresse: ${order.userAddress}`);
  doc.moveDown();

  // Détails des produits
  doc.text('Détails de la commande:', { underline: true });
  doc.moveDown(0.5);
  
  let subtotal = 0;
  order.OrderItems.forEach(item => {
    // Utiliser le prix original du produit (AVANT promotion)
    const unitPriceEuros = (item.productPrice / 100).toFixed(2);
    const lineTotalEuros = (item.productPrice * item.quantity / 100).toFixed(2);
    subtotal += item.productPrice * item.quantity; // Sous-total AVANT promotion en centimes
    
    // Afficher : quantité x nom - prix total de la ligne AVANT promotion
    doc.fontSize(12).text(`${item.quantity} x ${item.productName} - ${lineTotalEuros}€`);
  });
  
  doc.moveDown();
  doc.fontSize(14);
  
  // Calculs avec promotion
  if (order.promoCode && order.promoDiscount > 0) {
    // subtotal est en centimes (prix AVANT promotion)
    // order.totalAmount, order.promoDiscount sont en euros
    const subtotalEuros = (subtotal / 100).toFixed(2);
    const totalAmountEuros = order.totalAmount.toFixed(2);
    
    // order.promoDiscount est déjà en euros
    const promoDiscountEuros = order.promoDiscount.toFixed(2);
    
    doc.text(`Sous-total: ${subtotalEuros}€`);
    doc.text(`Code promo (${order.promoCode}): -${promoDiscountEuros}€`, { 
      fillColor: 'green' 
    });
    doc.fillColor('black');
    doc.moveDown(0.5);
    doc.fontSize(16).text(`TOTAL: ${totalAmountEuros}€`, { 
      underline: true,
      align: 'right'
    });
  } else {
    // order.totalAmount est en euros
    const totalAmountEuros = order.totalAmount.toFixed(2);
    doc.fontSize(16).text(`TOTAL: ${totalAmountEuros}€`, { 
      underline: true,
      align: 'right'
    });
  }

  // Pied de page
  doc.moveDown();
  doc.fontSize(10).text('Merci pour votre commande !', { align: 'center' });

  doc.end();

  return pdfPath;
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { default: OrderMongo } = await import('../models/OrderMongo.js');
    const orders = await OrderMongo.find({ userId: userId.toString() }).sort({ createdAt: -1 });
    
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      orderId: order.orderId,
      userId: order.userId,
      userName: order.userName,
      userAddress: order.userAddress,
      totalAmount: order.totalAmount,
      originalAmount: order.originalAmount,
      promoCode: order.promoCode,
      promoDiscount: order.promoDiscount,
      status: order.status,
      returnRequested: order.returnRequested,
      returnRequestDate: order.returnRequestDate,
      returnReason: order.returnReason,
      returnStatus: order.returnStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      OrderItems: order.items || []
    }));
    
    res.json(transformedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByPk(orderId, {
      include: [OrderItem]
    });
    const user = await User.findByPk(order.userId);

    if (!order || !user) {
      return res.status(404).json({ error: 'Order or User not found' });
    }

    const pdfPath = await generateInvoicePDF(order, user);

    res.download(pdfPath, (err) => {
      if (err) {
        console.error('Error downloading the invoice:', err);
        res.status(500).json({ error: 'Failed to download invoice' });
      }
    });
  } catch (error) {
    console.error('Failed to download invoice:', error);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { userId, items } = req.body;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const order = await Order.create({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userAddress: user.shippingAddress,
      totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    });

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          throw new Error('Product not found');
        }

        return OrderItem.create({
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          price: item.price,
        });
      })
    );

    res.status(201).json({ order, orderItems });
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { default: OrderMongo } = await import('../models/OrderMongo.js');
    const orders = await OrderMongo.find({}).sort({ createdAt: -1 });
    
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      orderId: order.orderId,
      userId: order.userId,
      userName: order.userName,
      userAddress: order.userAddress,
      totalAmount: order.totalAmount,
      status: order.status,
      returnRequested: order.returnRequested,
      returnRequestDate: order.returnRequestDate,
      returnReason: order.returnReason,
      returnStatus: order.returnStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      OrderItems: order.items || []
    }));
    
    res.status(200).json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const requestReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    const order = await Order.findOne({
      where: { id: id, userId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (order.status !== 'Completed') {
      return res.status(400).json({ error: 'Seules les commandes terminées peuvent faire l\'objet d\'une demande de retour' });
    }

    if (order.returnRequested) {
      return res.status(400).json({ error: 'Une demande de retour a déjà été effectuée pour cette commande' });
    }

    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

    if (daysDiff > 30) {
      return res.status(400).json({ error: 'Les demandes de retour ne peuvent être effectuées que dans les 30 jours suivant la commande' });
    }

    await order.update({
      returnRequested: true,
      returnRequestDate: new Date(),
      returnReason: reason,
      returnStatus: 'Requested'
    });

    const { default: OrderMongo } = await import('../models/OrderMongo.js');
    await OrderMongo.updateOne(
      { orderId: id },
      {
        returnRequested: true,
        returnRequestDate: new Date(),
        returnReason: reason,
        returnStatus: 'Requested'
      }
    );

    res.status(200).json({ message: 'Demande de retour soumise avec succès', order });
  } catch (error) {
    console.error('Erreur lors de la demande de retour:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const reorder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { default: OrderMongo } = await import('../models/OrderMongo.js');
    const order = await OrderMongo.findOne({ orderId: parseInt(id) });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId, totalPrice: 0 });
    }

    const addedProducts = [];
    const unavailableProducts = [];

    for (const orderItem of order.items) {
      const product = await ProductMongo.findOne({ productId: orderItem.productId });
      
      if (!product) {
        unavailableProducts.push(`${orderItem.productName} (produit supprimé)`);
        continue;
      }

      if (product.stock < orderItem.quantity) {
        unavailableProducts.push(`${product.name} (stock insuffisant: ${product.stock})`);
        continue;
      }

      const expiryTime = new Date(Date.now() + (1 * 60 * 1000)); // 1 minute

      let cartItem = await CartItem.findOne({
        where: { cartId: cart.id, productId: product.productId }
      });

      if (cartItem) {
        cartItem.quantity += orderItem.quantity;
        cartItem.price = cartItem.quantity * product.price;
        cartItem.reservationExpiry = expiryTime;
        await cartItem.save();
      } else {
        cartItem = await CartItem.create({
          cartId: cart.id,
          productId: product.productId,
          quantity: orderItem.quantity,
          price: product.price * orderItem.quantity,
          reservationExpiry: expiryTime
        });
      }

      try {
        await updateProductStockRelative(
          product.productId,
          -orderItem.quantity, // Quantité négative pour réserver
          userId,
          'reservation',
          `Réservation pour re-commande #${order.orderId}`,
          `reorder-${order.orderId}-${Date.now()}`
        );
        console.log(`✅ Stock réservé via architecture hybride - ${product.name}: ${orderItem.quantity} unités`);
      } catch (hybridError) {
        console.error('❌ Erreur architecture hybride:', hybridError);
        // Fallback : réservation classique - pas de fallback PostgreSQL ici car on utilise MongoDB
        console.log('Fallback: pas de réservation de stock pour ce produit');
      }

      addedProducts.push(`${product.name} x${orderItem.quantity}`);
    }

    const totalPrice = await CartItem.sum('price', { where: { cartId: cart.id } });
    cart.totalPrice = totalPrice || 0;
    await cart.save();

    res.json({
      message: 'Commande ajoutée au panier avec succès',
      cart,
      addedProducts,
      unavailableProducts,
      addedCount: addedProducts.length,
      unavailableCount: unavailableProducts.length
    });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ error: 'Erreur lors de la re-commande' });
  }
};

export const approveReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { processRefundNow = true } = req.body; // Option pour traiter le remboursement immédiatement

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (!order.returnRequested || order.returnStatus !== 'Requested') {
      return res.status(400).json({ error: 'Aucune demande de retour en attente pour cette commande' });
    }

    // Mettre à jour le statut d'approbation
    await order.update({
      returnStatus: 'Approved'
    });

    const { default: OrderMongo } = await import('../models/OrderMongo.js');
    await OrderMongo.updateOne(
      { orderId: id },
      { returnStatus: 'Approved' }
    );

    let refundResult = null;

    // Traiter le remboursement automatiquement si demandé
    if (processRefundNow) {
      try {
        const { processRefund } = await import('./stripeController.js');
        refundResult = await processRefund(id);
        
        if (refundResult.success) {
          res.status(200).json({ 
            message: 'Retour approuvé et remboursement traité avec succès', 
            order,
            refund: {
              id: refundResult.refundId,
              amount: refundResult.amount,
              status: refundResult.status
            }
          });
        } else {
          res.status(200).json({ 
            message: 'Retour approuvé mais erreur lors du remboursement automatique', 
            order,
            refundError: refundResult.message,
            note: 'Le remboursement devra être traité manuellement'
          });
        }
      } catch (refundError) {
        console.error('Erreur lors du remboursement automatique:', refundError);
        res.status(200).json({ 
          message: 'Retour approuvé mais erreur lors du remboursement automatique', 
          order,
          refundError: refundError.message,
          note: 'Le remboursement devra être traité manuellement'
        });
      }
    } else {
      res.status(200).json({ 
        message: 'Retour approuvé avec succès', 
        order,
        note: 'Remboursement à traiter manuellement'
      });
    }

  } catch (error) {
    console.error('Erreur lors de l\'approbation du retour:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const denyReturn = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (!order.returnRequested || order.returnStatus !== 'Requested') {
      return res.status(400).json({ error: 'Aucune demande de retour en attente pour cette commande' });
    }

    await order.update({
      returnStatus: 'Denied'
    });

    const { default: OrderMongo } = await import('../models/OrderMongo.js');
    await OrderMongo.updateOne(
      { orderId: id },
      { returnStatus: 'Denied' }
    );

    res.status(200).json({ message: 'Retour refusé avec succès', order });
  } catch (error) {
    console.error('Erreur lors du refus du retour:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Nouveau endpoint pour traiter les remboursements manuellement
export const processManualRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount } = req.body; // Montant optionnel pour remboursement partiel

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (order.returnStatus !== 'Approved') {
      return res.status(400).json({ error: 'Le retour doit être approuvé avant le remboursement' });
    }

    if (order.refundRequested && order.refundStatus === 'succeeded') {
      return res.status(400).json({ error: 'Cette commande a déjà été remboursée' });
    }

    const { processRefund } = await import('./stripeController.js');
    const refundResult = await processRefund(id, refundAmount);

    if (refundResult.success) {
      res.status(200).json({
        message: refundResult.message,
        refund: {
          id: refundResult.refundId,
          amount: refundResult.amount,
          status: refundResult.status
        }
      });
    } else {
      res.status(400).json({
        error: 'Erreur lors du remboursement',
        details: refundResult.message
      });
    }

  } catch (error) {
    console.error('Erreur lors du remboursement manuel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Nouveau endpoint pour télécharger la facture d'avoir
export const downloadCreditNote = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (!order.refundRequested || !order.refundId) {
      return res.status(400).json({ error: 'Aucune facture d\'avoir disponible pour cette commande' });
    }

    const invoiceDir = path.join(__dirname, '../../invoices');
    const creditNotePath = path.join(invoiceDir, `credit_note_${order.id}_${order.refundId.slice(-8)}.pdf`);

    // Vérifier si le fichier existe
    if (!fs.existsSync(creditNotePath)) {
      return res.status(404).json({ error: 'Facture d\'avoir non trouvée' });
    }

    // Envoyer le fichier
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture_avoir_${order.id}_${order.refundId.slice(-8)}.pdf"`);
    
    const fileStream = fs.createReadStream(creditNotePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Erreur lors du téléchargement de la facture d\'avoir:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
