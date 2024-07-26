import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  reservationExpiry: { type: Date, required: true },
});

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  totalPrice: { type: Number, required: true, default: 0 },
  items: [CartItemSchema],
});

const CartMongo = mongoose.model('Cart', CartSchema);

export default CartMongo;
