// src/controllers/stripeController.js
import Stripe from 'stripe';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

export const createCheckoutSession = async (req, res) => {
  const { cartItems } = req.body;

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

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
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
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const cart = await Cart.findOne({ where: { userId: session.metadata.userId }, include: CartItem });

      for (const item of cart.CartItems) {
        const product = await Product.findByPk(item.productId);
        product.stock -= item.quantity;
        await product.save();
      }

      await CartItem.destroy({ where: { cartId: cart.id } });
      cart.totalPrice = 0;
      await cart.save();

      res.status(200).json({ message: 'Cart cleared and stock updated' });
    } catch (error) {
      console.error('Error clearing cart and updating stock:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(400).json({ message: 'Event type not handled' });
  }
};
