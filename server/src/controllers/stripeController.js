import Stripe from 'stripe';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import StockSyncService from '../services/stockSyncService.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export const createCheckoutSession = async (req, res) => {
  const { cartItems, appliedPromo, finalTotal } = req.body;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ where: { userId }, include: { model: CartItem, include: [Product] } });
    if (!cart) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    let lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.Product.name,
        },
        unit_amount: item.Product.price, // Prix déjà en centimes, pas de multiplication
      },
      quantity: item.quantity,
    }));

    const sessionData = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId: req.user.id,
        cartId: cart.id,
        appliedPromoCode: appliedPromo?.code || '',
        promoDiscount: appliedPromo?.discount || 0,
      },
    };

    // Si une promotion est appliquée, utiliser les coupons Stripe
    if (appliedPromo && appliedPromo.discount > 0) {
      try {
        const coupon = await stripe.coupons.create({
          amount_off: Math.round(appliedPromo.discount * 100), // Convertir euros en centimes pour Stripe
          currency: 'eur',
          duration: 'once',
          name: `Code Promo: ${appliedPromo.code}`,
        });
        
        sessionData.discounts = [{
          coupon: coupon.id,
        }];
      } catch (couponError) {
        console.error('Error creating coupon:', couponError);
        // Fallback: ajouter comme ligne d'article
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: `🎫 Code Promo: ${appliedPromo.code}`,
              description: appliedPromo.promotion?.description || 'Réduction appliquée',
            },
            unit_amount: -Math.round(appliedPromo.discount * 100), // Convertir euros en centimes pour Stripe
          },
          quantity: 1,
        });
      }
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const userId = session.metadata.userId;
      const cartId = session.metadata.cartId;
      const appliedPromoCode = session.metadata.appliedPromoCode;
      const promoDiscount = parseFloat(session.metadata.promoDiscount) || 0;
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const finalAmount = session.amount_total / 100;
      const originalAmount = finalAmount + promoDiscount;

      // Récupérer les informations de paiement Stripe pour les remboursements
      let paymentIntentId = null;
      let chargeId = null;
      
      if (session.payment_intent) {
        paymentIntentId = session.payment_intent;
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
          if (paymentIntent.charges && paymentIntent.charges.data.length > 0) {
            chargeId = paymentIntent.charges.data[0].id;
          }
        } catch (error) {
          console.error('Error retrieving payment intent:', error);
        }
      }

      const order = await Order.create({
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userAddress: user.shippingAddress,
        totalAmount: finalAmount,
        originalAmount: originalAmount,
        promoCode: appliedPromoCode || null,
        promoDiscount: promoDiscount,
        status: 'Completed',
        stripePaymentIntentId: paymentIntentId,
        stripeChargeId: chargeId
      });

      const orderItems = [];

      for (const item of lineItems.data) {
        const product = await Product.findOne({ where: { name: item.description } });

        if (!product) {
          throw new Error('Product not found');
        }

        const orderItem = await OrderItem.create({
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          price: item.amount_total / 100,
        });

        orderItems.push(orderItem);

        // Confirmer la vente dans le système de stock
        try {
          await StockSyncService.confirmSale(
            product.id, 
            item.quantity, 
            user.id, 
            order.id
          );
          console.log(`✅ Vente confirmée - ${product.name}: ${item.quantity} unités`);
        } catch (stockError) {
          console.error(`❌ Erreur confirmation vente ${product.name}:`, stockError);
          // Ne pas faire échouer la commande pour une erreur de stock
        }
      }

      order.OrderItems = orderItems;

      const { default: OrderMongo } = await import('../models/OrderMongo.js');
      await OrderMongo.create({
        orderId: order.id,
        userId: user.id.toString(),
        userName: order.userName,
        userAddress: order.userAddress,
        totalAmount: order.totalAmount,
        originalAmount: order.originalAmount,
        promoCode: order.promoCode,
        promoDiscount: order.promoDiscount,
        stripePaymentIntentId: order.stripePaymentIntentId,
        stripeChargeId: order.stripeChargeId,
        items: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
          price: item.price
        })),
        status: order.status,
        returnRequested: false,
        returnStatus: null,
        refundRequested: false,
        refundAmount: null,
        refundId: null,
        refundStatus: null,
        refundDate: null
      });

      console.log(`Order ${order.id} created for user ${user.id} and synchronized with MongoDB`);

      // Mettre à jour le compteur d'utilisation de la promotion
      if (appliedPromoCode) {
        try {
          const { default: Promotion } = await import('../models/Promotion.js');
          const { default: PromotionMongo } = await import('../models/PromotionMongo.js');
          
          // Mise à jour PostgreSQL
          await Promotion.increment('usageCount', {
            where: { code: appliedPromoCode }
          });
          
          // Mise à jour MongoDB
          await PromotionMongo.updateOne(
            { code: appliedPromoCode },
            { $inc: { usageCount: 1 } }
          );
          
          console.log(`Promotion ${appliedPromoCode} usage count updated`);
        } catch (promoError) {
          console.error('Error updating promotion usage count:', promoError);
        }
      }

      const pdfPath = await generateInvoicePDF(order, user, {
        promoCode: appliedPromoCode,
        promoDiscount: promoDiscount,
        originalAmount: originalAmount
      });

      await CartItem.destroy({ where: { cartId: cartId } });

      await sendInvoiceEmail(user.email, pdfPath);

    } catch (error) {
      console.error('Error processing order:', error);
      return res.status(500).send(`Webhook Error: ${error.message}`);
    }
  }

  res.status(200).send('Received');
};

const generateInvoicePDF = async (order, user, promoInfo = null) => {
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
  if (promoInfo && promoInfo.promoCode && promoInfo.promoDiscount > 0) {
    // subtotal est en centimes (prix AVANT promotion)
    // order.totalAmount, promoInfo.promoDiscount et promoInfo.originalAmount sont en euros
    const subtotalEuros = (subtotal / 100).toFixed(2);
    const totalAmountEuros = order.totalAmount.toFixed(2);
    
    // promoInfo.promoDiscount est déjà en euros
    const promoDiscountEuros = promoInfo.promoDiscount.toFixed(2);
    
    doc.text(`Sous-total: ${subtotalEuros}€`);
    doc.text(`Code promo (${promoInfo.promoCode}): -${promoDiscountEuros}€`, { 
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

// Fonction pour générer une facture d'avoir (note de crédit)
const generateCreditNotePDF = async (order, user, refundAmount, refundId) => {
  const doc = new PDFDocument();
  const invoiceDir = path.join(__dirname, '../../invoices');

  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir);
  }

  const pdfPath = path.join(invoiceDir, `credit_note_${order.id}_${refundId.slice(-8)}.pdf`);
  doc.pipe(fs.createWriteStream(pdfPath));

  // En-tête avec couleur distinctive
  doc.fillColor('#dc2626'); // Rouge pour la facture d'avoir
  doc.fontSize(25).text('FACTURE D\'AVOIR', { align: 'center' });
  doc.fillColor('black');
  doc.moveDown();
  
  // Informations de la note de crédit
  doc.fontSize(16).text(`Numéro de commande: ${order.id}`);
  doc.text(`Numéro de remboursement: ${refundId}`);
  doc.text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')}`);
  doc.text(`Date de remboursement: ${order.refundDate ? new Date(order.refundDate).toLocaleDateString('fr-FR') : 'N/A'}`);
  doc.moveDown();
  
  // Informations client
  doc.text(`Nom: ${order.userName}`);
  doc.text(`Adresse: ${order.userAddress}`);
  doc.moveDown();

  // Raison du remboursement
  doc.fontSize(14).text('Motif du remboursement:', { underline: true });
  doc.fontSize(12).text(order.returnReason || 'Demande de retour client');
  doc.moveDown();

  // Détails du remboursement
  doc.fontSize(14).text('Détails du remboursement:', { underline: true });
  doc.moveDown(0.5);
  
  // Si remboursement partiel, détailler
  if (refundAmount < order.totalAmount) {
    // Les montants sont déjà en euros
    const totalAmountEuros = order.totalAmount.toFixed(2);
    const refundAmountEuros = refundAmount.toFixed(2);
    const remainingAmountEuros = (order.totalAmount - refundAmount).toFixed(2);
    
    doc.fontSize(12).text(`Montant original de la commande: ${totalAmountEuros}€`);
    doc.text(`Montant du remboursement partiel: ${refundAmountEuros}€`);
    doc.text(`Montant conservé: ${remainingAmountEuros}€`);
  } else {
    // Remboursement total - afficher les produits
    if (order.OrderItems && order.OrderItems.length > 0) {
      order.OrderItems.forEach(item => {
        // Utiliser le prix original du produit (AVANT promotion) en centimes, le convertir en euros
        const itemPriceEuros = (item.productPrice / 100).toFixed(2);
        doc.text(`${item.quantity} x ${item.productName} - ${itemPriceEuros}€`);
      });
    }
    
    doc.moveDown();
    
    // Afficher les promotions si applicable
    if (order.promoCode && order.promoDiscount > 0) {
      // order.originalAmount et order.promoDiscount sont en euros
      const originalAmountEuros = (order.originalAmount || order.totalAmount).toFixed(2);
      const promoDiscountEuros = order.promoDiscount.toFixed(2);
      
      doc.text(`Sous-total original: ${originalAmountEuros}€`);
      doc.text(`Promotion appliquée (${order.promoCode}): -${promoDiscountEuros}€`, { 
        fillColor: 'green' 
      });
      doc.fillColor('black');
    }
  }
  
  doc.moveDown();
  
  // Montant total du remboursement en évidence
  doc.fontSize(18);
  doc.fillColor('#dc2626');
  // refundAmount est déjà en euros
  const refundAmountEuros = refundAmount.toFixed(2);
  doc.text(`MONTANT REMBOURSÉ: ${refundAmountEuros}€`, { 
    underline: true,
    align: 'right'
  });
  doc.fillColor('black');

  // Informations légales
  doc.moveDown();
  doc.fontSize(10);
  doc.text('Cette facture d\'avoir annule partiellement ou totalement la facture d\'origine.', { align: 'center' });
  doc.text('Le remboursement sera effectué sur le moyen de paiement utilisé lors de l\'achat.', { align: 'center' });
  doc.moveDown();
  doc.text(`Traité le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, { align: 'center' });

  doc.end();

  return pdfPath;
};

// Fonction de remboursement automatique
export const processRefund = async (orderId, refundAmount = null) => {
  try {
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      throw new Error('Commande non trouvée');
    }

    if (!order.stripeChargeId && !order.stripePaymentIntentId) {
      throw new Error('Informations de paiement Stripe manquantes');
    }

    // Calculer le montant du remboursement (total par défaut)
    const amountToRefund = refundAmount || order.totalAmount;
    const amountInCents = Math.round(amountToRefund * 100);

    let refund;
    
    // Tenter le remboursement via charge_id d'abord, puis payment_intent
    if (order.stripeChargeId) {
      refund = await stripe.refunds.create({
        charge: order.stripeChargeId,
        amount: amountInCents,
        reason: 'requested_by_customer',
        metadata: {
          orderId: orderId.toString(),
          originalAmount: order.totalAmount.toString()
        }
      });
    } else if (order.stripePaymentIntentId) {
      refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        amount: amountInCents,
        reason: 'requested_by_customer',
        metadata: {
          orderId: orderId.toString(),
          originalAmount: order.totalAmount.toString()
        }
      });
    } else {
      throw new Error('Aucune méthode de remboursement disponible');
    }

    // Mettre à jour la commande avec les informations de remboursement
    await order.update({
      refundRequested: true,
      refundAmount: amountToRefund,
      refundId: refund.id,
      refundStatus: refund.status,
      refundDate: new Date(),
      returnStatus: 'Processed'
    });

    // Mettre à jour MongoDB
    const { default: OrderMongo } = await import('../models/OrderMongo.js');
    await OrderMongo.updateOne(
      { orderId: orderId },
      {
        refundRequested: true,
        refundAmount: amountToRefund,
        refundId: refund.id,
        refundStatus: refund.status,
        refundDate: new Date(),
        returnStatus: 'Processed'
      }
    );

    console.log(`Refund processed for order ${orderId}: ${refund.id} - ${amountToRefund}€`);
    
    // Générer la facture d'avoir
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findByPk(order.userId);
      
      if (user) {
        // Récupérer les détails de la commande pour la facture d'avoir
        const OrderItem = (await import('../models/OrderItem.js')).default;
        const fullOrder = await Order.findByPk(orderId, {
          include: [OrderItem]
        });
        
        const creditNotePath = await generateCreditNotePDF(fullOrder, user, amountToRefund, refund.id);
        
        // Envoyer la facture d'avoir par email
        await sendCreditNoteEmail(user.email, creditNotePath, amountToRefund);
        
        console.log(`Credit note generated and sent for order ${orderId}`);
      }
    } catch (creditNoteError) {
      console.error('Error generating credit note:', creditNoteError);
      // Ne pas faire échouer le remboursement si la facture d'avoir échoue
    }
    
    return {
      success: true,
      refundId: refund.id,
      amount: amountToRefund,
      status: refund.status,
      message: `Remboursement de ${amountToRefund}€ traité avec succès`
    };

  } catch (error) {
    console.error('Error processing refund:', error);
    
    // Mettre à jour le statut d'erreur
    try {
      const order = await Order.findByPk(orderId);
      if (order) {
        await order.update({
          refundStatus: 'failed',
          returnStatus: 'Approved' // Remettre en "Approved" pour retry manuel
        });

        const { default: OrderMongo } = await import('../models/OrderMongo.js');
        await OrderMongo.updateOne(
          { orderId: orderId },
          {
            refundStatus: 'failed',
            returnStatus: 'Approved'
          }
        );
      }
    } catch (updateError) {
      console.error('Error updating failed refund status:', updateError);
    }

    return {
      success: false,
      error: error.message,
      message: `Erreur lors du remboursement: ${error.message}`
    };
  }
};

const sendInvoiceEmail = async (userEmail, pdfPath) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Your Store"',
    to: userEmail,
    subject: 'La facture de votre commande',
    text: 'Merci pour votre commande. Vous trouverez votre facture en pièce jointe',
    attachments: [
      {
        filename: path.basename(pdfPath),
        path: pdfPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

// Fonction pour envoyer la facture d'avoir par email
const sendCreditNoteEmail = async (userEmail, pdfPath, refundAmount) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Your Store"',
    to: userEmail,
    subject: `Facture d'avoir - Remboursement de ${refundAmount}€`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Facture d'Avoir</h2>
        
        <p>Bonjour,</p>
        
        <p>Nous vous confirmons le traitement de votre demande de remboursement.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Détails du remboursement :</h3>
          <p><strong>Montant remboursé :</strong> ${refundAmount}€</p>
          <p><strong>Méthode :</strong> Remboursement sur votre moyen de paiement original</p>
          <p><strong>Délai :</strong> 3-5 jours ouvrés selon votre banque</p>
        </div>
        
        <p>Vous trouverez votre facture d'avoir en pièce jointe de cet email.</p>
        
        <p>Si vous avez des questions concernant ce remboursement, n'hésitez pas à nous contacter.</p>
        
        <p>Cordialement,<br>L'équipe Lemondedesmugs</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          Cet email a été envoyé automatiquement suite au traitement de votre remboursement.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `facture_avoir_${path.basename(pdfPath)}`,
        path: pdfPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};
