// src/routes/stripe.js
import express from 'express';
import { createCheckoutSession, handleStripeWebhook } from '../controllers/stripeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-checkout-session', authenticateToken, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
