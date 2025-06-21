import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  productId: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: false },
  onSale: { type: Boolean, default: false }
});

// Index pour optimiser les recherches facettées
ProductSchema.index({ name: 'text', description: 'text' }); // Recherche textuelle
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ onSale: 1 });
ProductSchema.index({ category: 1, brand: 1 }); // Index composé
ProductSchema.index({ price: 1, category: 1 }); // Index composé

const ProductMongo = mongoose.model('Product', ProductSchema);

export default ProductMongo;
