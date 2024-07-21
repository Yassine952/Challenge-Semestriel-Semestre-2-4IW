import axios from 'axios';
import { User } from '../types/User';
import { Order } from '../types/Order';

const API_URL = `${import.meta.env.VITE_API_URL}/users`;

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

export const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/');
  return response.data;
};

export const fetchUserById = async (id: number): Promise<User> => {
  const response = await apiClient.get(`/${id}`);
  return response.data;
};

export const createUser = async (user: User): Promise<User> => {
  const response = await apiClient.post('/', user);
  return response.data;
};

export const updateUser = async (id: number, user: User): Promise<User> => {
  const response = await apiClient.put(`/${id}`, user);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/${id}`);
};

export const fetchUserProfile = async (): Promise<User> => {
  const response = await apiClient.get('/profile');
  return response.data;
};

export const fetchUserOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get('/orders');
  return response.data;
};

export const downloadInvoice = async (orderId: number) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/orders/${orderId}/invoice`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoice_${orderId}.pdf`);
  document.body.appendChild(link);
  link.click();
};
