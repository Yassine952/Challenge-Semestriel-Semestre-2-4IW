import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Product from './Product.js';
import User from './User.js';

const StockHistory = sequelize.define('StockHistory', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Peut être null pour les mouvements automatiques
    references: {
      model: User,
      key: 'id'
    }
  },
  movementType: {
    type: DataTypes.ENUM(
      'purchase',        // Achat/Réapprovisionnement
      'sale',           // Vente
      'adjustment',     // Ajustement manuel
      'return',         // Retour de commande
      'reservation',    // Réservation panier
      'release',        // Libération réservation
      'damage',         // Produit endommagé
      'theft',          // Vol/Perte
      'transfer',       // Transfert
      'initial'         // Stock initial
    ),
    allowNull: false
  },
  quantityBefore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Stock avant le mouvement'
  },
  quantityChange: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Changement de quantité (positif = ajout, négatif = retrait)'
  },
  quantityAfter: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Stock après le mouvement'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Raison du mouvement'
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Référence externe (numéro de commande, bon de livraison, etc.)'
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Coût unitaire lors du mouvement'
  },
  totalValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valeur totale du mouvement'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes additionnelles'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Données supplémentaires (orderId, cartId, etc.)'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['productId', 'createdAt']
    },
    {
      fields: ['movementType']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Relations
Product.hasMany(StockHistory, { foreignKey: 'productId' });
StockHistory.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(StockHistory, { foreignKey: 'userId' });
StockHistory.belongsTo(User, { foreignKey: 'userId' });

export default StockHistory; 