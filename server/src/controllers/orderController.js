// server/src/controllers/orderController.js
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import User from '../models/User.js';
import { generateInvoicePDF } from '../services/pdfService.js';

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({ where: { userId }, include: [OrderItem] });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const order = await Order.findOne({ where: { id, userId }, include: [OrderItem] });

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    const user = await User.findByPk(userId);

    const pdfPath = await generateInvoicePDF(order, user);

    res.download(pdfPath);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
