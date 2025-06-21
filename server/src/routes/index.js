import express from 'express';
import authRouter from './auth.js';
import productRouter from './product.js';
import cartRouter from './cart.js';
import stripeRouter from './stripe.js';
import profileRouter from './profile.js';
import alertRouter from './alert.js';
import stockRouter from './stock.js';
import comptaRouter from './compta.js';
import userPreferencesRouter from './userPreferences.js';
import orderRouter from './order.js';
import userRouter from './user.js';
import promotionRouter from './promotion.js';
import configRouter from './config.js';
import dashboardRouter from './dashboardRoutes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/stripe', stripeRouter);
router.use('/profile', profileRouter);
router.use('/alerts', alertRouter);
router.use('/stock', stockRouter);
router.use('/compta', comptaRouter);
router.use('/user-preferences', userPreferencesRouter);
router.use('/orders', orderRouter);
router.use('/users', userRouter);
router.use('/promotions', promotionRouter);
router.use('/config', configRouter);
router.use('/dashboard', dashboardRouter);

export { router as indexRouter };
