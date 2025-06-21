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
}, (error) => {
  return Promise.reject(error);
});

export const fetchUsers = async (): Promise<User[]> => {
  console.log('fetchUsers called');
  console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
  console.log('API URL:', `${import.meta.env.VITE_API_URL}/users`);
  
  try {
    const response = await apiClient.get('/');
    console.log('fetchUsers response:', response.data);
    return response.data;
  } catch (error) {
    console.error('fetchUsers error:', error);
    throw error;
  }
};

export const fetchOrders = async (): Promise<Order[]> => {
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
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};

export const fetchUserOrders = async (): Promise<Order[]> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  console.log("Orders response from API:", response.data);
  return response.data;
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  console.log('fetchAllOrders called');
  console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
  console.log('API URL:', `${import.meta.env.VITE_API_URL}/orders/orders`);
  
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/orders`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    console.log('fetchAllOrders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('fetchAllOrders error:', error);
    throw error;
  }
};

export const downloadInvoice = async (orderId: number) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/${orderId}/invoice`, {
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
  link.remove();
};
