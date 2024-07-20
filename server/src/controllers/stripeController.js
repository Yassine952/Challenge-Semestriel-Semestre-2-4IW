import Stripe from 'stripe';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

// Mettre à jour pour utiliser la version d'API 2024-06-20
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
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
      metadata: {
        userId: req.user.id, // Assuming req.user.id contains the authenticated user's ID
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
      console.log('Session data:', session);

      const cart = await Cart.findOne({ where: { userId: session.metadata.userId }, include: CartItem });

      if (cart) {
        for (const item of cart.CartItems) {
          const product = await Product.findByPk(item.productId);
          if (product) {
            product.stock -= item.quantity;
            await product.save();
          }
        }

        await CartItem.destroy({ where: { cartId: cart.id } });
        cart.totalPrice = 0;
        await cart.save();

        console.log(`Cart for user ${session.metadata.userId} cleared and stock updated.`);
      }

      res.status(200).json({ message: 'Cart cleared and stock updated' });
    } catch (error) {
      console.error('Error clearing cart and updating stock:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(400).json({ message: 'Event type not handled' });
  }
};
