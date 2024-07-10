import axios from 'axios';
import { User } from '../types/User';

const API_URL = `${import.meta.env.VITE_API_URL}/users`;

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const fetchUserById = async (id: number): Promise<User> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createUser = async (user: User): Promise<User> => {
  const response = await axios.post(API_URL, user);
  return response.data;
};

export const updateUser = async (id: number, user: User): Promise<User> => {
  const response = await axios.put(`${API_URL}/${id}`, user);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
