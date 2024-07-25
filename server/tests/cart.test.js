import { addToCart, removeFromCart, clearCart, getCart } from '../src/controllers/cartController.js';
import { jest } from '@jest/globals';
import Cart from '../src/models/Cart.js';
import CartItem from '../src/models/CartItem.js';
import Product from '../src/models/Product.js';

jest.mock('../src/models/Cart.js');
jest.mock('../src/models/CartItem.js');
jest.mock('../src/models/Product.js');

describe('Cart Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add a product to the cart', async () => {
      const req = {
        body: { productId: 1, quantity: 2 },
        user: { id: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Product.findByPk.mockResolvedValue({ id: 1, stock: 10, price: 100 });
      Cart.findOne.mockResolvedValue({ id: 1, userId: 1, totalPrice: 0 });
      CartItem.findOne.mockResolvedValue(null);
      CartItem.create.mockResolvedValue({});
      CartItem.sum.mockResolvedValue(200);

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return 404 if product is not found', async () => {
      const req = {
        body: { productId: 1, quantity: 2 },
        user: { id: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Product.findByPk.mockResolvedValue(null);

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Produit non trouvé' });
    });

    it('should return 400 if insufficient stock', async () => {
      const req = {
        body: { productId: 1, quantity: 20 },
        user: { id: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Product.findByPk.mockResolvedValue({ id: 1, stock: 10, price: 100 });

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Quantité insuffisante en stock' });
    });
  });

  describe('removeFromCart', () => {
    it('should remove a product from the cart', async () => {
      const req = {
        params: { productId: 1 },
        user: { id: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Cart.findOne.mockResolvedValue({ id: 1, userId: 1, totalPrice: 200 });
      CartItem.findOne.mockResolvedValue({ id: 1, cartId: 1, productId: 1, quantity: 2, price: 200 });
      Product.findByPk.mockResolvedValue({ id: 1, stock: 10 });
      CartItem.destroy.mockResolvedValue(1);

      await removeFromCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return 404 if cart is not found', async () => {
      const req = {
        params: { productId: 1 },
        user: { id: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Cart.findOne.mockResolvedValue(null);

      await removeFromCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Panier non trouvé' });
    });
  });

  describe('clearCart', () => {
    it('should clear the cart', async () => {
      const req = {
        user: { id: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Cart.findOne.mockResolvedValue({ id: 1, userId: 1, totalPrice: 200 });
      CartItem.findAll.mockResolvedValue([{ id: 1, cartId: 1, productId: 1, quantity: 2 }]);
      Product.findByPk.mockResolvedValue({ id: 1, stock: 10 });
      CartItem.destroy.mockResolvedValue(1);

      await clearCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return 404 if cart is not found', async () => {
      const req = {
        user: { id: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Cart.findOne.mockResolvedValue(null);

      await clearCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Panier non trouvé' });
    });
  });

  describe('getCart', () => {
    it('should get the cart', async () => {
      const req = {
        user: { id: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Cart.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        totalPrice: 200,
        CartItems: [
          {
            id: 1,
            cartId: 1,
            productId: 1,
            quantity: 2,
            Product: { id: 1, name: 'Test Product', price: 100 }
          }
        ]
      });

      await getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return 400 if user ID is missing', async () => {
      const req = {
        user: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID is missing' });
    });
  });
});
