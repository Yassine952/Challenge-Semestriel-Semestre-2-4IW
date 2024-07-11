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

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get('/');
  return response.data;
};

export const fetchProductById = async (id: number): Promise<Product> => {
  const response = await apiClient.get(`/${id}`);
  return response.data;
};

export const createProduct = async (product: Product): Promise<Product> => {
  const response = await apiClient.post('/', product);
  return response.data;
};

export const updateProduct = async (id: number, product: Product): Promise<Product> => {
  const response = await apiClient.put(`/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/${id}`);
};

export const searchProducts = async (queryParams: Record<string, any>): Promise<Product[]> => {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await apiClient.get(`/search?${queryString}`);
  return response.data;
};
