import { Product } from './Product';

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  Product: Product;
}

export interface Cart {
  id: number;
  userId: number;
  totalPrice: number;
  CartItems: CartItem[];
}
