// client/models/cart.ts

export interface CartItem {
  productId: number;
  quantity: number;
  price: number; // Total price for the given quantity of this product
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}
