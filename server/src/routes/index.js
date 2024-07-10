import express from 'express';
import authRouter from './auth.js';
import productRouter from './product.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);

export { router as indexRouter };
