import express from 'express';
import authRouter from './auth.js';
import productRouter from './product.js';
import cartRouter from './cart.js';
import stripeRouter from './stripe.js';
import profileRouter from './profile.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/stripe', stripeRouter);
router.use('/profile', profileRouter);

export { router as indexRouter };
