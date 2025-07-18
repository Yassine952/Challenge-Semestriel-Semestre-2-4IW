export interface Product {
  productId: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  onSale: boolean;
  imageUrl?: string;
}
