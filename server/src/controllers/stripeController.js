// server/src/controllers/stripeController.js
import Stripe from 'stripe';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';  // Mettre à jour le chemin si nécessaire
import { generateInvoicePDF } from '../services/pdfService.js';  // Mettre à jour le chemin si nécessaire

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
        currency: 'usd',
        product_data: {
          name: item.Product.name,
        },
        unit_amount: item.Product.price * 100, // Price in cents
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
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Webhook received:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const cart = await Cart.findOne({ where: { userId: session.metadata.userId }, include: { model: CartItem, include: [Product] } });

      if (cart) {
        const order = await Order.create({
          userId: session.metadata.userId,
          totalAmount: cart.totalPrice,
          status: 'Completed',
        });

        for (const item of cart.CartItems) {
          await OrderItem.create({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          });
          await item.destroy();
        }

        cart.totalPrice = 0;
        await cart.save();

        const user = await cart.getUser();  // Assuming you have a getUser method in the Cart model

        // Generate PDF invoice
        const pdfPath = await generateInvoicePDF(order, user);

        // Send confirmation email with PDF
        await sendOrderConfirmationEmail(user.email, pdfPath);

        console.log(`Order created and cart for user ${session.metadata.userId} cleared.`);
      }

      res.status(200).json({ message: 'Order created and cart cleared' });
    } catch (error) {
      console.error('Error creating order and clearing cart:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(400).json({ message: 'Event type not handled' });
  }
};
