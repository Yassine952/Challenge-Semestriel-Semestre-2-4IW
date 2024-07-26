import request from 'supertest';
import express from 'express';
import { getOrder } from '../src/controllers/orderController';
import jwt from 'jsonwebtoken';
import SequelizeMock from 'sequelize-mock';

const app = express();
app.use(express.json());

app.get('/api/orders/:id', getOrder);

const DBConnectionMock = new SequelizeMock();
const OrderMock = DBConnectionMock.define('Order', {
  id: 1,
  userId: 1,
  totalPrice: 100,
});
const OrderItemMock = DBConnectionMock.define('OrderItem', {
  orderId: 1,
  productId: 1,
  quantity: 2,
  price: 50,
});

OrderMock.$queueResult([
  OrderMock.build({
    id: 1,
    userId: 1,
    totalPrice: 100,
    OrderItems: [
      OrderItemMock.build({ orderId: 1, productId: 1, quantity: 2, price: 50 }),
    ],
  }),
]);

OrderItemMock.$queueResult([
  OrderItemMock.build({ orderId: 1, productId: 1, quantity: 2, price: 50 }),
]);

jest.mock('../src/middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, role: 'ROLE_USER' };
    next();
  },
  authorize: () => (req, res, next) => {
    next();
  },
}));

describe('GET /api/orders/:id', () => {
  it('should get an order by ID', async () => {
    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);

    const response = await request(app)
      .get('/api/orders/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.totalPrice).toBe(100);
    expect(response.body.OrderItems).toHaveLength(1);
    expect(response.body.OrderItems[0].price).toBe(50);
  });

  it('should return 404 if order not found', async () => {
    OrderMock.$queueResult(null); 

    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);

    const response = await request(app)
      .get('/api/orders/2')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
