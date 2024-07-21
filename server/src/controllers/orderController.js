import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

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

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      include: [OrderItem]
    });
    res.json(orders);
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
