import axios from 'axios';
import { Product } from '../types/Product';

const API_URL = `${import.meta.env.VITE_API_URL}/products`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fetch products from MongoDB
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Fetch product by ID from MongoDB
export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Fetch products on sale from MongoDB
export const fetchProductsOnSale = async (): Promise<Product[]> => {
  const response = await axios.get(`${API_URL}?onSale=true`);
  return response.data;
};

// Fetch categories from MongoDB
export const fetchCategories = async (): Promise<string[]> => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data;
};

// Create a new product in both PostgreSQL and MongoDB
export const createProduct = async (product: Product): Promise<Product> => {
  const response = await apiClient.post('/', product);
  return response.data;
};

// Update a product in both PostgreSQL and MongoDB
export const updateProduct = async (id: number, product: Product): Promise<Product> => {
  const response = await apiClient.put(`/${id}`, product);
  return response.data;
};

// Delete a product in both PostgreSQL and MongoDB
export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/${id}`);
};

// Search products in MongoDB
export const searchProducts = async (query: any): Promise<Product[]> => {
  const response = await axios.get(`${API_URL}/search`, { params: query });
  return response.data;
};
