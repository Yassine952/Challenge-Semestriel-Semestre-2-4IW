import express from 'express';
import cors from 'cors';
import { indexRouter } from './routes/index.js';
import authRouter from './routes/auth.js'; // Ajoutez cette ligne
import sequelize from './config/database.js';

const server = express();

server.use(cors());
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
server.use('/api/users', authRouter); // Ajoutez cette ligne pour les routes d'authentification

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
