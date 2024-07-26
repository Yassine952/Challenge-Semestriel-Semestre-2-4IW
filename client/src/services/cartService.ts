import axios from 'axios';
import { Cart } from '../types/Cart';

const API_URL = `${import.meta.env.VITE_API_URL}/cart`;

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
}, (error) => {
  return Promise.reject(error);
});

export const getCart = async (): Promise<Cart> => {
  const response = await apiClient.get('/');
  return response.data;
};

export const addToCart = async (productId: number, quantity: number): Promise<Cart> => {
  const response = await apiClient.post('/add', { productId, quantity });
  return response.data;
};

export const removeFromCart = async (productId: number): Promise<Cart> => {
  const response = await apiClient.delete(`/remove/${productId}`);
  return response.data;
};

export const clearCart = async (): Promise<Cart> => {
  const response = await apiClient.delete('/clear');
  return response.data;
};

export const clearCartAfterPayment = async (): Promise<void> => {
  await apiClient.post('/clear-after-payment');
};
