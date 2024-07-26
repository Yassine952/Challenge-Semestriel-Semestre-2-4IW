import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  productId: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  onSale: { type: Boolean, default: false }
});

const ProductMongo = mongoose.model('Product', ProductSchema);

export default ProductMongo;
