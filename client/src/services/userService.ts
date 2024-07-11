import axios from 'axios';
import { User } from '../types/User';

const API_URL = `${import.meta.env.VITE_API_URL}/users`; // Correction de l'URL

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
