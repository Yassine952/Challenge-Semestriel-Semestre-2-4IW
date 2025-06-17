import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/admin/dashboard`;

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
  console.log('Dashboard API Request:', config.method?.toUpperCase(), config.url, config.baseURL);
  return config;
}, (error) => {
  console.error('Dashboard API Request Error:', error);
  return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
  console.log('Dashboard API Response:', response.status, response.config.url);
  return response;
}, (error) => {
  console.error('Dashboard API Response Error:', error.response?.status, error.response?.data, error.config?.url);
  return Promise.reject(error);
});

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  ordersChange: number;
  revenueChange: number;
  usersChange: number;
  productsChange: number;
}

export interface OrdersOverTime {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }>;
}

export interface RevenueByCategory {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }>;
}

export interface TopProducts {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }>;
}

export interface OrderStatusDistribution {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }>;
}

export const dashboardService = {
  async getStats(period: string = '30d'): Promise<DashboardStats> {
    const response = await apiClient.get(`/stats?period=${period}`);
    return response.data;
  },

  async getOrdersOverTime(period: string = '30d'): Promise<OrdersOverTime> {
    const response = await apiClient.get(`/orders-over-time?period=${period}`);
    return response.data;
  },

  async getRevenueOverTime(period: string = '30d'): Promise<OrdersOverTime> {
    const response = await apiClient.get(`/revenue-over-time?period=${period}`);
    return response.data;
  },

  async getRevenueByCategory(period: string = '30d'): Promise<RevenueByCategory> {
    const response = await apiClient.get(`/revenue-by-category?period=${period}`);
    return response.data;
  },

  async getTopProducts(period: string = '30d', limit: number = 10): Promise<TopProducts> {
    const response = await apiClient.get(`/top-products?period=${period}&limit=${limit}`);
    return response.data;
  },

  async getOrderStatusDistribution(period: string = '30d'): Promise<OrderStatusDistribution> {
    const response = await apiClient.get(`/order-status-distribution?period=${period}`);
    return response.data;
  },

  async getUsersOverTime(period: string = '30d'): Promise<OrdersOverTime> {
    const response = await apiClient.get(`/users-over-time?period=${period}`);
    return response.data;
  }
};

export default dashboardService; 