import axios from 'axios';
import { Promotion, PromoValidationResult } from '../types/Promotion';

const API_URL = `${import.meta.env.VITE_API_URL}/promotions`;

// Créer une promotion
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

// Récupérer toutes les promotions
export const fetchPromotions = async (filters?: { active?: boolean; expired?: boolean }): Promise<Promotion[]> => {
  // Si on veut les promotions actives, utiliser la route publique
  if (filters?.active) {
    const response = await axios.get(`${API_URL}/active-all`);
    return response.data;
  }
  
  // Sinon, utiliser la route protégée pour les admins
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  
  if (filters?.expired) params.append('expired', 'true');
  
  const response = await axios.get(`${API_URL}?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Récupérer une promotion par ID
export const fetchPromotionById = async (id: number): Promise<Promotion> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Mettre à jour une promotion
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

// Supprimer une promotion
export const deletePromotion = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Valider un code promo (public)
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

// Appliquer un code promo
export const applyPromoCode = async (code: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.post(`${API_URL}/apply`, { code }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Récupérer les promotions actives pour un produit
export const fetchActivePromotionsForProduct = async (productId?: number, category?: string): Promise<Promotion[]> => {
  const params = new URLSearchParams();
  if (productId) params.append('productId', productId.toString());
  if (category) params.append('category', category);
  
  const response = await axios.get(`${API_URL}/active?${params.toString()}`);
  return response.data;
}; 