import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, required: true },
  userId: { type: String, required: true }, // Stocker l'ID utilisateur sous forme de chaîne
  userName: { type: String, required: true },
  userAddress: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  items: [orderItemSchema],
  status: { type: String, required: true }
});

const OrderMongo = mongoose.model('Order', orderSchema);

export default OrderMongo;
