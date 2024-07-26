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
  const response = await axios.get(API_URL);
  return response.data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const fetchProductsOnSale = async (): Promise<Product[]> => {
  const response = await axios.get(`${API_URL}?onSale=true`);
  return response.data;
};

export const fetchCategories = async (): Promise<string[]> => {
  const response = await axios.get(`${API_URL}/categories`);
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

export const searchProducts = async (query: any): Promise<Product[]> => {
  const response = await axios.get(`${API_URL}/search`, { params: query });
  return response.data;
};
