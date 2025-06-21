import mongoose from 'mongoose';

const StockHistorySchema = new mongoose.Schema({
  // Identifiants
  stockHistoryId: { type: Number, required: true }, // ID PostgreSQL
  productId: { type: Number, required: true, index: true },
  userId: { type: Number, required: false },
  
  // Informations du mouvement
  movementType: { 
    type: String, 
    required: true,
    enum: ['purchase', 'sale', 'adjustment', 'return', 'reservation', 'release', 'damage', 'theft', 'transfer', 'initial'],
    index: true
  },
  
  // Quantités
  quantityBefore: { type: Number, required: true },
  quantityChange: { type: Number, required: true },
  quantityAfter: { type: Number, required: true },
  
  // Détails
  reason: { type: String },
  reference: { type: String, index: true },
  cost: { type: Number },
  totalValue: { type: Number },
  notes: { type: String },
  
  // Métadonnées enrichies pour MongoDB
  metadata: {
    orderId: { type: Number },
    cartId: { type: Number },
    userId: { type: Number },
    productName: { type: String },
    productCategory: { type: String },
    userEmail: { type: String }
  },
  
  // Données temporelles optimisées
  dateInfo: {
    year: { type: Number, index: true },
    month: { type: Number, index: true },
    day: { type: Number, index: true },
    hour: { type: Number },
    weekday: { type: Number },
    week: { type: Number }
  }
}, {
  timestamps: true,
  collection: 'stockHistory'
});

// Index composés pour les requêtes de graphiques
StockHistorySchema.index({ productId: 1, createdAt: 1 });
StockHistorySchema.index({ movementType: 1, createdAt: 1 });
StockHistorySchema.index({ 'dateInfo.year': 1, 'dateInfo.month': 1, 'dateInfo.day': 1 });
StockHistorySchema.index({ createdAt: 1, quantityAfter: 1 });

// Index pour les agrégations temporelles
StockHistorySchema.index({ 
  'dateInfo.year': 1, 
  'dateInfo.month': 1, 
  'dateInfo.day': 1,
  productId: 1 
});

export default mongoose.model('StockHistory', StockHistorySchema); 