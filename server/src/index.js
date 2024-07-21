import express from 'express';
import cors from 'cors';
import { indexRouter } from './routes/index.js';
import authRouter from './routes/auth.js';
import productRouter from './routes/product.js';
import cartRouter from './routes/cart.js';
import stripeRouter from './routes/stripe.js';
import profileRouter from './routes/profile.js';
import orderRouter from './routes/order.js';
import sequelize from './config/database.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { cleanExpiredItems } from './controllers/cartController.js';
import bodyParser from 'body-parser';

dotenv.config();

const server = express();

server.use(cors());

// Utilisation de bodyParser.raw() pour les webhooks Stripe
server.post('/api/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
server.use(express.json());

sequelize.authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch(err => {
    console.error('Failed to connect to PostgreSQL', err);
  });

// Utilisation des routeurs
server.use('/api', indexRouter);
server.use('/api/auth', authRouter);
server.use('/api/products', productRouter);
server.use('/api/cart', cartRouter);
server.use('/api/stripe', stripeRouter);
server.use('/api/users/profile', profileRouter); // Utilisation du chemin correct pour les routes profile
server.use('/api/users/orders', orderRouter);  // Utilisation du chemin correct pour les routes order

// Middleware de gestion des erreurs globales
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Middleware pour gérer les routes non définies
server.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 8000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port}`);
});

// Planifiez une tâche cron pour nettoyer les éléments expirés toutes les minutes
cron.schedule('* * * * *', async () => {
  try {
    await cleanExpiredItems();
  } catch (error) {
    console.error('Error cleaning expired items:', error);
  }
});
