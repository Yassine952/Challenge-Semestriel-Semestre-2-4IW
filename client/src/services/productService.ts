import axios from 'axios';
import { Product } from '../types/Product';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

export const createProduct = async (product: Product): Promise<Product> => {
  console.log('Sending product data:', product); // Ajout de log
  const response = await apiClient.post('/products', product);
  console.log('Response data:', response.data); // Ajout de log
  return response.data;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get('/products');
  return response.data;
};

export const fetchProductById = async (id: number): Promise<Product> => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const updateProduct = async (id: number, product: Product): Promise<Product> => {
  const response = await apiClient.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};
