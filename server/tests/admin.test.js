import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import { register, login } from '../src/controllers/authController.js';
import { addToCart, clearCart } from '../src/controllers/cartController.js';
import { createProduct, updateProduct, deleteProduct } from '../src/controllers/productController.js';
import { createUser, updateUser, deleteUser } from '../src/controllers/userController.js';
import Cart from '../src/models/Cart.js';
import CartItem from '../src/models/CartItem.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';
import sequelize from '../src/config/database.js';
import { jest } from '@jest/globals';

jest.mock('../src/models/Cart.js');
jest.mock('../src/models/CartItem.js');
jest.mock('../src/models/Product.js');
jest.mock('../src/models/User.js');

const app = express();
app.use(express.json());

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/cart/add', addToCart);
app.delete('/api/cart/clear', clearCart);
app.post('/api/products', createProduct);
app.put('/api/products/:id', updateProduct);
app.delete('/api/products/:id', deleteProduct);
app.post('/api/users', createUser);
app.put('/api/users/:id', updateUser);
app.delete('/api/users/:id', deleteUser);

describe('Admin Operations', () => {
  let adminToken;
  let productId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    await User.create({
      id: 5,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: await bcrypt.hash('AdminPass123!', 12),
      role: 'ROLE_ADMIN',
      isConfirmed: true,
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'AdminPass123!',
      });

    adminToken = response.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new product', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Product',
        price: 100,
        stock: 50,
        category:'test'
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('New Product');
    productId = response.body.id;
  });

  it('should update a product', async () => {
    const response = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Product',
        price: 150,
        stock: 30,
        category:'test'
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Product');
  });

  it('should delete a user', async () => {
    const userResponse = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'User',
        lastName: 'ToDelete',
        email: 'user.todelete@test.com',
        password: 'UserPass123!',
        role: 'ROLE_USER',
        isConfirmed: true,
      });

    const userId = userResponse.body.id;

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted');
  });
});
