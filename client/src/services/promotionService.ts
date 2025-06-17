import axios from 'axios';
import { Promotion, PromoValidationResult } from '../types/Promotion';

const API_URL = `${import.meta.env.VITE_API_URL}/promotions`;
export const createPromotion = async (promotion: Omit<Promotion, 'promotionId' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<Promotion> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, promotion, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.promotion;
};
export const fetchPromotions = async (filters?: { active?: boolean; expired?: boolean }): Promise<Promotion[]> => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  
  if (filters?.active) params.append('active', 'true');
  if (filters?.expired) params.append('expired', 'true');
  
  const response = await axios.get(`${API_URL}?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};
export const fetchPromotionById = async (id: number): Promise<Promotion> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};
export const updatePromotion = async (id: number, promotion: Partial<Promotion>): Promise<Promotion> => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/${id}`, promotion, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};
export const deletePromotion = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
export const validatePromoCode = async (
  code: string, 
  cartTotal: number, 
  cartItems: any[]
): Promise<PromoValidationResult> => {
  const response = await axios.post(`${API_URL}/validate`, {
    code,
    cartTotal,
    cartItems
  });
  return response.data;
};
export const applyPromoCode = async (code: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.post(`${API_URL}/apply`, { code }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};
export const fetchActivePromotionsForProduct = async (productId?: number, category?: string): Promise<Promotion[]> => {
  const params = new URLSearchParams();
  if (productId) params.append('productId', productId.toString());
  if (category) params.append('category', category);
  
  const response = await axios.get(`${API_URL}/active?${params.toString()}`);
  return response.data;
}; 