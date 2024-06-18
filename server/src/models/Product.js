// server/src/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  onSale: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
