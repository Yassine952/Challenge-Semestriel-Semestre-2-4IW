import Stripe from 'stripe';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
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
  const { cartItems } = req.body;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ where: { userId }, include: { model: CartItem, include: [Product] } });
    if (!cart) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.Product.name,
        },
        unit_amount: item.Product.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId: req.user.id,
        cartId: cart.id,
      },
    });

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
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      const order = await Order.create({
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userAddress: user.shippingAddress,
        totalAmount: session.amount_total / 100,
        status: 'Completed', 
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
      }

      order.OrderItems = orderItems;

      console.log(`Order ${order.id} created for user ${user.id}`);

      const pdfPath = await generateInvoicePDF(order, user);

      await CartItem.destroy({ where: { cartId: cartId } });

      await sendInvoiceEmail(user.email, pdfPath);

    } catch (error) {
      console.error('Error processing order:', error);
      return res.status(500).send(`Webhook Error: ${error.message}`);
    }
  }

  res.status(200).send('Received');
};

const generateInvoicePDF = async (order, user) => {
  const doc = new PDFDocument();
  const invoiceDir = path.join(__dirname, '../../invoices');

  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir);
  }

  const pdfPath = path.join(invoiceDir, `invoice_${order.id}.pdf`);
  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(25).text('Facture', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Numéro de commande: ${order.id}`);
  doc.text(`Nom: ${order.userName}`);
  doc.text(`Adresse: ${order.userAddress}`);
  doc.moveDown();
  doc.text(`Montant total: ${order.totalAmount} €`); 
  doc.moveDown();

  doc.text('Détails de la commande:', { underline: true });
  order.OrderItems.forEach(item => {
    doc.text(`${item.quantity} x ${item.productName} - ${item.price} €`);
  });

  doc.end();

  return pdfPath;
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
