export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
  }
  
  export interface Order {
  _id: string;
  orderId: number;
  userId: string;
  userName: string;
  userAddress: string;
  totalAmount: number;
  originalAmount?: number;
  promoCode?: string;
  promoDiscount?: number;
  status: string;
  returnRequested: boolean;
  returnRequestDate?: string;
  returnReason?: string;
  returnStatus?: string;
  // Nouvelles propriétés de remboursement
  refundRequested?: boolean;
  refundAmount?: number;
  refundId?: string;
  refundStatus?: string;
  refundDate?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  createdAt: string;
  updatedAt: string;
  OrderItems: OrderItem[];
}
  