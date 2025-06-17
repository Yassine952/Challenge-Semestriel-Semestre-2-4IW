<template>
  <div class="alert-history bg-white shadow-md rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">📋 Historique des Alertes</h2>
      <div class="flex items-center space-x-4">
        <div v-if="unreadCount > 0" class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          {{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }}
        </div>
        <button
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Tout marquer comme lu
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mb-6 flex flex-wrap items-center space-x-4">
      <div>
        <label for="typeFilter" class="block text-sm font-medium text-gray-700 mb-1">
          Filtrer par type :
        </label>
        <select
          id="typeFilter"
          v-model="selectedType"
          @change="loadAlerts"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les types</option>
          <option value="new_product">Nouveaux produits</option>
          <option value="restock">Réapprovisionnement</option>
          <option value="price_change">Changements de prix</option>
          <option value="newsletter">Newsletter</option>
        </select>
      </div>
    </div>

    <!-- Liste des alertes -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Chargement des alertes...</p>
    </div>

    <div v-else-if="alerts.length === 0" class="text-center py-8">
      <div class="text-gray-400 text-6xl mb-4">📭</div>
      <p class="text-gray-600">Aucune alerte trouvée</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        :class="[
          'border rounded-lg p-4 transition-colors cursor-pointer',
          alert.isRead 
            ? 'border-gray-200 bg-gray-50' 
            : 'border-blue-200 bg-blue-50 shadow-sm'
        ]"
        @click="markAsRead(alert)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <span :class="getAlertTypeClass(alert.alertType)">
                {{ getAlertTypeIcon(alert.alertType) }}
              </span>
              <h3 :class="[
                'font-medium',
                alert.isRead ? 'text-gray-700' : 'text-gray-900'
              ]">
                {{ alert.title }}
              </h3>
              <div v-if="!alert.isRead" class="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            
            <p :class="[
              'text-sm mb-2',
              alert.isRead ? 'text-gray-600' : 'text-gray-700'
            ]">
              {{ alert.message }}
            </p>
            
            <!-- Informations sur le produit -->
            <div v-if="alert.Product" class="bg-white border border-gray-200 rounded p-3 mb-2">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">{{ alert.Product.name }}</h4>
                  <p class="text-sm text-gray-600">{{ alert.Product.category }}</p>
                </div>
                <div class="text-right">
                  <span class="font-bold text-blue-600">{{ alert.Product.price }}€</span>
                </div>
              </div>
            </div>
            
            <!-- Métadonnées spécifiques -->
            <div v-if="alert.metadata" class="text-xs text-gray-500">
              <div v-if="alert.alertType === 'price_change' && alert.metadata.oldPrice">
                Ancien prix: {{ alert.metadata.oldPrice }}€ → Nouveau prix: {{ alert.metadata.newPrice }}€
                ({{ alert.metadata.isIncrease ? '+' : '-' }}{{ alert.metadata.changePercent }}%)
              </div>
              <div v-else-if="alert.alertType === 'newsletter' && alert.metadata.productsCount">
                {{ alert.metadata.productsCount }} produit(s) dans cette newsletter
              </div>
            </div>
          </div>
          
          <div class="text-right text-xs text-gray-500 ml-4">
            {{ formatDate(alert.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center space-x-2">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Précédent
      </button>
      
      <span class="px-4 py-2 text-sm text-gray-700">
        Page {{ currentPage }} sur {{ totalPages }}
      </span>
      
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Suivant
      </button>
    </div>

    <!-- Messages de statut -->
    <div v-if="message" :class="messageClass" class="p-4 rounded-md mt-4">
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

interface AlertHistoryItem {
  id: number;
  alertType: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
  Product?: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
}

interface AlertHistoryResponse {
  alerts: AlertHistoryItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export default defineComponent({
  name: 'UserAlertHistory',
  setup() {
    const alerts = ref<AlertHistoryItem[]>([]);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const totalCount = ref(0);
    const unreadCount = ref(0);
    const selectedType = ref('');
    const isLoading = ref(false);
    const message = ref('');
    const messageClass = ref('');

    const loadAlerts = async (page = 1) => {
      isLoading.value = true;
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10'
        });
        
        if (selectedType.value) {
          params.append('type', selectedType.value);
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-preferences/alerts/history?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des alertes');
        }

        const data: AlertHistoryResponse = await response.json();
        alerts.value = data.alerts;
        currentPage.value = data.currentPage;
        totalPages.value = data.totalPages;
        totalCount.value = data.totalCount;
      } catch (error: any) {
        showMessage(error.message || 'Erreur lors du chargement des alertes', 'error');
      } finally {
        isLoading.value = false;
      }
    };

    const loadUnreadCount = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-preferences/alerts/unread-count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement du compteur');
        }

        const data = await response.json();
        unreadCount.value = data.unreadCount;
      } catch (error: any) {
        console.error('Erreur lors du chargement du compteur d\'alertes non lues:', error);
      }
    };

    const markAsRead = async (alert: AlertHistoryItem) => {
      if (alert.isRead) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-preferences/alerts/${alert.id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour');
        }

        alert.isRead = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      } catch (error: any) {
        showMessage(error.message || 'Erreur lors de la mise à jour', 'error');
      }
    };

    const markAllAsRead = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-preferences/alerts/mark-all-read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour');
        }

        alerts.value.forEach(alert => alert.isRead = true);
        unreadCount.value = 0;
        showMessage('Toutes les alertes ont été marquées comme lues', 'success');
      } catch (error: any) {
        showMessage(error.message || 'Erreur lors de la mise à jour', 'error');
      }
    };

    const changePage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        loadAlerts(page);
      }
    };

    const getAlertTypeIcon = (type: string): string => {
      const icons: Record<string, string> = {
        'new_product': '🆕',
        'restock': '🔄',
        'price_change': '💰',
        'newsletter': '📧',
        'low_stock': '⚠️'
      };
      return icons[type] || '🔔';
    };

    const getAlertTypeClass = (type: string): string => {
      const classes: Record<string, string> = {
        'new_product': 'text-blue-600',
        'restock': 'text-green-600',
        'price_change': 'text-orange-600',
        'newsletter': 'text-purple-600',
        'low_stock': 'text-red-600'
      };
      return classes[type] || 'text-gray-600';
    };

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Il y a moins d\'une heure';
      } else if (diffInHours < 24) {
        return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
      } else if (diffInHours < 48) {
        return 'Hier';
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    };

    const showMessage = (msg: string, type: 'success' | 'error') => {
      message.value = msg;
      messageClass.value = type === 'success' 
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-red-100 text-red-800 border border-red-200';
      
      setTimeout(() => {
        message.value = '';
      }, 5000);
    };

    onMounted(() => {
      loadAlerts();
      loadUnreadCount();
    });

    return {
      alerts,
      currentPage,
      totalPages,
      totalCount,
      unreadCount,
      selectedType,
      isLoading,
      message,
      messageClass,
      loadAlerts,
      markAsRead,
      markAllAsRead,
      changePage,
      getAlertTypeIcon,
      getAlertTypeClass,
      formatDate
    };
  }
});
</script>

<style scoped>
.alert-history {
  max-width: 900px;
}
</style> 