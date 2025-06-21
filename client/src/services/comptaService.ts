import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export interface FinancialStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersThisMonth: number;
  totalInvoices: number;
  invoicesThisMonth: number;
  averageOrderValue: number;
  aovGrowth: number;
}

export interface ExtractionFilters {
  startDate: string;
  endDate: string;
  status?: string;
  format: 'csv' | 'excel' | 'pdf';
}

export interface ExtractionSummary {
  period: string;
  count: number;
  totalAmount: number;
  format: string;
  fileName: string;
  downloadUrl: string;
}

export const comptaService = {
  // Récupérer les statistiques financières
  async getFinancialStats(): Promise<FinancialStats> {
    try {
      const response = await axios.get(`${API_URL}/compta/stats`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Extraire les factures
  async extractInvoices(filters: ExtractionFilters): Promise<{ success: boolean; summary: ExtractionSummary }> {
    try {
      const response = await axios.post(`${API_URL}/compta/extract-invoices`, filters, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'extraction des factures:', error);
      throw error;
    }
  },

  // Générer un rapport financier
  async generateFinancialReport(): Promise<{ success: boolean; fileName: string; downloadUrl: string }> {
    try {
      const response = await axios.post(`${API_URL}/compta/financial-report`, {}, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw error;
    }
  },

  // Télécharger un fichier de manière sécurisée avec authentification
  async downloadFile(fileName: string): Promise<void> {
    try {
      const response = await axios.get(`${API_URL}/compta/download/${fileName}`, {
        headers: getAuthHeaders(),
        responseType: 'blob' // Important pour les fichiers
      });

      // Créer un blob à partir de la réponse
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream'
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  }
}; 