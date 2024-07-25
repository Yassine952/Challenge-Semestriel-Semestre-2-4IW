import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import { register, login } from '../src/controllers/authController.js';
import { addToCart, getCart, removeFromCart, clearCart } from '../src/controllers/cartController.js';
import { updateUserProfile } from '../src/controllers/profileController.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Cart from '../src/models/Cart.js';
import CartItem from '../src/models/CartItem.js';

const app = express();
app.use(express.json());

// Mock middleware d'authentification
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1 }; // Simuler un utilisateur avec l'ID 1
  next();
};

// Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/cart/add', mockAuthMiddleware, addToCart);
app.get('/api/cart', mockAuthMiddleware, getCart);
app.delete('/api/cart/remove/:productId', mockAuthMiddleware, removeFromCart);
app.delete('/api/cart/clear', mockAuthMiddleware, clearCart);
app.put('/api/users/profile', mockAuthMiddleware, updateUserProfile);

let mockProductId;
let token;

beforeAll(async () => {
  // Hacher le mot de passe avant de créer l'utilisateur
  const hashedPassword = await bcrypt.hash('Testtestudyr&1', 12);

  // Créer un utilisateur et un produit dans la base de données de test
  await User.create({ id: 1, firstName: 'yass', lastName: 'abd', email: 'test.test@test.com', password: hashedPassword, shippingAddress:'50 rue du test', isConfirmed: true });
  
  const product = await Product.create({ name: 'Product 1', price: 100,category :'test', stock: 10 });
  mockProductId = product.id;
});

afterAll(async () => {
  // Nettoyer la base de données de test
  await CartItem.destroy({ where: {} });
  await Cart.destroy({ where: {} });
  await Product.destroy({ where: {} });
  await User.destroy({ where: {} });
});

describe('User Registration and Authentication', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'Password123!',
        shippingAddress: '123 Main St',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("veuillez vérifier votre email pour confirmer votre compte.");
  });

  it('should log in an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.test@test.com',
        password: 'Testtestudyr&1',
      });

    console.log(response.body); // Ajoutez ce log pour voir la réponse de l'API

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });
});

describe('Cart Operations', () => {
  it('should add a product to the cart', async () => {
    const response = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: mockProductId,
        quantity: 1,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalPrice');
  });

  it('should not add a product to the cart with insufficient stock', async () => {
    const response = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: mockProductId,
        quantity: 100, // Quantité élevée pour simuler le stock insuffisant
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Quantité insuffisante en stock');
  });

  it('should clear the cart', async () => {
    const response = await request(app)
      .delete('/api/cart/clear')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.totalPrice).toBe(0);
  });
});

describe('Profile Operations', () => {
  it('should update user profile', async () => {
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
      });

    expect(response.status).toBe(200);
    expect(response.body.firstName).toBe('UpdatedFirstName');
    expect(response.body.lastName).toBe('UpdatedLastName');
  });
});
