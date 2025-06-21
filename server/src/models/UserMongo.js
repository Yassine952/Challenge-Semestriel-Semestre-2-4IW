import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true }, 
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  passwordLastChanged: {
    type: Date,
  },
  passwordNeedsReset: {
    type: Boolean,
    default: false,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: 'ROLE_USER',
  },
  // Préférences d'alertes email
  alertNewProducts: {
    type: Boolean,
    default: true,
  },
  alertRestock: {
    type: Boolean,
    default: true,
  },
  alertPriceChanges: {
    type: Boolean,
    default: true,
  },
  alertNewsletter: {
    type: Boolean,
    default: true,
  },
  // Catégories d'intérêt pour les alertes
  alertCategories: {
    type: [String],
    default: [],
  },
});

const UserMongo = mongoose.model('User', userSchema);
export default UserMongo;
