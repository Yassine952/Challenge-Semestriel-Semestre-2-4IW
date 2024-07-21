export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
  }
  
  export interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    status: string;
    OrderItems: OrderItem[];
  }
  