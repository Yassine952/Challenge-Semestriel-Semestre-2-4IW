import mongoose from 'mongoose';

const StockHistorySchema = new mongoose.Schema({

  stockHistoryId: { type: Number, required: true },
  productId: { type: Number, required: true, index: true },
  userId: { type: Number, required: false },

  movementType: { 
    type: String, 
    required: true,
    enum: ['purchase', 'sale', 'adjustment', 'return', 'reservation', 'release', 'damage', 'theft', 'transfer', 'initial'],
    index: true
  },

  quantityBefore: { type: Number, required: true },
  quantityChange: { type: Number, required: true },
  quantityAfter: { type: Number, required: true },

  reason: { type: String },
  reference: { type: String, index: true },
  cost: { type: Number },
  totalValue: { type: Number },
  notes: { type: String },

  metadata: {
    orderId: { type: Number },
    cartId: { type: Number },
    userId: { type: Number },
    productName: { type: String },
    productCategory: { type: String },
    userEmail: { type: String }
  },

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

StockHistorySchema.index({ productId: 1, createdAt: 1 });
StockHistorySchema.index({ movementType: 1, createdAt: 1 });
StockHistorySchema.index({ 'dateInfo.year': 1, 'dateInfo.month': 1, 'dateInfo.day': 1 });
StockHistorySchema.index({ createdAt: 1, quantityAfter: 1 });

StockHistorySchema.index({ 
  'dateInfo.year': 1, 
  'dateInfo.month': 1, 
  'dateInfo.day': 1,
  productId: 1 
});

export default mongoose.model('StockHistory', StockHistorySchema); 