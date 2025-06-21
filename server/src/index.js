import express from 'express';
import cors from 'cors';
import { indexRouter } from './routes/index.js';
import authRouter from './routes/auth.js';
import productRouter from './routes/product.js';
import cartRouter from './routes/cart.js';
import stripeRouter from './routes/stripe.js';
import profileRouter from './routes/profile.js';
import orderRouter from './routes/order.js';
import userRoutes from './routes/user.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import alertRoutes from './routes/alert.js';
import userPreferencesRoutes from './routes/userPreferences.js';
import promotionRoutes from './routes/promotion.js';
import stockRoutes from './routes/stock.js';
import comptaRoutes from './routes/compta.js';
import sequelize from './config/database.js';
import connectMongoDB from './config/mongo.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { cleanExpiredItems } from './controllers/cartController.js';
import bodyParser from 'body-parser';

dotenv.config();

const server = express();

server.use(cors());

server.post('/api/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
server.use(express.json());

connectMongoDB();

sequelize.authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synchronized with schema updates');
  })
  .catch(err => {
    console.error('Failed to connect to PostgreSQL', err);
  });

server.use('/api', indexRouter);
server.use('/api/auth', authRouter);
server.use('/api/products', productRouter);
server.use('/api/cart', cartRouter);
server.use('/api/stripe', stripeRouter);
server.use('/api/users/profile', profileRouter);
server.use('/api/users/orders', orderRouter);
server.use('/api/users', userRoutes);
server.use('/api/admin/dashboard', dashboardRoutes);
server.use('/api/alerts', alertRoutes);
server.use('/api/user-preferences', userPreferencesRoutes);
server.use('/api/promotions', promotionRoutes);
server.use('/api/stock', stockRoutes);
server.use('/api/compta', comptaRoutes);

server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 8000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port}`);
});

cron.schedule('* * * * *', async () => {
  try {
    await cleanExpiredItems();
  } catch (error) {
    console.error('Error cleaning expired items:', error);
  }
});
