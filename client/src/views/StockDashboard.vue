<template>
  <div class="stock-dashboard min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center">
              📊 Dashboard de Gestion des Stocks
            </h1>
            <p class="text-sm text-gray-600 mt-1">
              Suivi en temps réel de l'évolution des stocks par produit
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500">
              Dernière mise à jour: {{ lastUpdate }}
            </div>
            <button 
              @click="refreshAll"
              :disabled="isRefreshing"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <svg v-if="isRefreshing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              🔄 Actualiser tout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


      <!-- Graphique d'évolution des stocks -->
      <div class="mb-8">
        <StockEvolutionChart ref="stockChart" @data-loaded="onStockDataLoaded" />
      </div>

      <!-- Statistiques détaillées -->
      <div v-if="detailedStats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                📦
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Produits gérés</p>
              <p class="text-2xl font-semibold text-gray-900">{{ detailedStats.totalProducts }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                📈
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Stock total</p>
              <p class="text-2xl font-semibold text-gray-900">{{ detailedStats.totalStock.toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                ⚖️
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Stock moyen</p>
              <p class="text-2xl font-semibold text-gray-900">{{ detailedStats.averageStock }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                ⚠️
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Stocks critiques</p>
              <p class="text-2xl font-semibold text-red-600">{{ criticalStockAlerts.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuration du seuil critique -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">⚙️ Configuration des Alertes</h3>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white">
                  ⚠️
                </div>
              </div>
              <div class="ml-4">
                <h4 class="font-medium text-yellow-900">Seuil de Stock Critique</h4>
                <p class="text-sm text-yellow-700">
                  Les produits avec un stock inférieur ou égal à ce seuil déclencheront des alertes automatiques
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-2">
                <label for="threshold" class="text-sm font-medium text-yellow-900">Seuil:</label>
                <input
                  id="threshold"
                  type="number"
                  v-model="newThreshold"
                  min="1"
                  max="100"
                  class="w-20 px-3 py-2 border border-yellow-300 rounded-lg text-center focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <span class="text-sm text-yellow-700">unités</span>
              </div>
              <button
                @click="updateThreshold"
                :disabled="isUpdatingThreshold || newThreshold === currentThreshold"
                class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg v-if="isUpdatingThreshold" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isUpdatingThreshold ? 'Mise à jour...' : 'Mettre à jour' }}
              </button>
            </div>
          </div>
          <div class="mt-3 text-xs text-yellow-600">
            <strong>Seuil actuel:</strong> {{ currentThreshold }} unités
            • <strong>Produits concernés:</strong> {{ criticalStockAlerts.length }} produit(s)
          </div>
        </div>
      </div>

      <!-- Alertes de Stock Critique (détaillées) -->
      <div v-if="criticalStockAlerts.length > 0" class="bg-white rounded-lg shadow p-6 mb-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
            ⚠️
          </div>
          Alertes de Stock Critique
        </h3>
        <div class="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h4 class="text-sm font-medium text-red-800 mb-3">
                Alertes de Stock Critique
              </h4>
              <ul class="list-disc pl-5 space-y-1">
                <li v-for="alert in criticalStockAlerts" :key="alert.name" class="text-sm text-red-700">
                  <strong>{{ alert.name }}:</strong> {{ alert.currentStock }} unité{{ alert.currentStock > 1 ? 's' : '' }} restante{{ alert.currentStock > 1 ? 's' : '' }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">🚀 Actions Rapides</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <router-link 
            to="/products" 
            class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                📦
              </div>
            </div>
            <div class="ml-4">
              <p class="font-medium text-blue-900">Gérer les Produits</p>
              <p class="text-sm text-blue-700">Ajouter, modifier ou supprimer des produits</p>
            </div>
          </router-link>

          <router-link 
            to="/admin/orders" 
            class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                📋
              </div>
            </div>
            <div class="ml-4">
              <p class="font-medium text-green-900">Voir les Commandes</p>
              <p class="text-sm text-green-700">Suivi des commandes et livraisons</p>
            </div>
          </router-link>

          <button 
            @click="generateStockReport"
            class="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                📊
              </div>
            </div>
            <div class="ml-4">
              <p class="font-medium text-purple-900">Rapport de Stock</p>
              <p class="text-sm text-purple-700">Générer un rapport détaillé</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import StockEvolutionChart from '../components/StockEvolutionChart.vue';
import { useNotifications } from '../composables/useNotifications';
import axios from 'axios';

export default defineComponent({
  name: 'StockDashboard',
  components: {
    StockEvolutionChart
  },
  setup() {
    const { showWarning, showSuccess, showError } = useNotifications();
    const stockChart = ref<any>(null);
    const isRefreshing = ref(false);
    const lastUpdate = ref('');
    const stockData = ref<any>(null);
    const currentThreshold = ref(10);
    const newThreshold = ref(10);
    const isUpdatingThreshold = ref(false);

    const criticalStockAlerts = computed(() => {
      if (!stockData.value || !stockData.value.productsInfo) return [];
      
      return stockData.value.productsInfo.filter((product: any) => product.currentStock <= currentThreshold.value);
    });

    const detailedStats = computed(() => {
      if (!stockData.value || !stockData.value.productsInfo) return null;
      
      const products = stockData.value.productsInfo;
      const totalStock = products.reduce((sum: number, p: any) => sum + p.currentStock, 0);
      const averageStock = Math.round(totalStock / products.length);
      
      return {
        totalProducts: products.length,
        totalStock,
        averageStock
      };
    });

    const onStockDataLoaded = (data: any) => {
      stockData.value = data;
      updateLastUpdateTime();
    };

    const updateLastUpdateTime = () => {
      const now = new Date();
      lastUpdate.value = now.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const refreshAll = async () => {
      isRefreshing.value = true;
      try {
        if (stockChart.value && stockChart.value.loadStockEvolution) {
          await stockChart.value.loadStockEvolution();
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement:', error);
      } finally {
        isRefreshing.value = false;
      }
    };

    const generateStockReport = () => {
      if (!stockData.value) {
        showWarning('Rapport impossible', 'Aucune donnée disponible pour générer le rapport');
        return;
      }

      // Générer un rapport simple en format texte
      let report = '=== RAPPORT DE STOCK ===\n\n';
      report += `Date: ${new Date().toLocaleString('fr-FR')}\n\n`;
      
      if (detailedStats.value) {
        report += `STATISTIQUES GÉNÉRALES:\n`;
        report += `- Nombre de produits: ${detailedStats.value.totalProducts}\n`;
        report += `- Stock total: ${detailedStats.value.totalStock.toLocaleString()} unités\n`;
        report += `- Stock moyen: ${detailedStats.value.averageStock} unités\n`;
        report += `- Produits en stock critique: ${criticalStockAlerts.value.length}\n\n`;
      }

      report += `DÉTAIL PAR PRODUIT:\n`;
      stockData.value.productsInfo.forEach((product: any) => {
        const status = product.currentStock < 10 ? '⚠️ CRITIQUE' : '✅ OK';
        report += `- ${product.name}: ${product.currentStock} unités ${status}\n`;
      });

      if (criticalStockAlerts.value.length > 0) {
        report += `\nALERTES CRITIQUES:\n`;
        criticalStockAlerts.value.forEach((alert: any) => {
          report += `⚠️ ${alert.name}: ${alert.currentStock} unités restantes\n`;
        });
      }

      // Télécharger le rapport
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-stock-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    // Charger le seuil actuel depuis le serveur (source de vérité unique)
    const loadCurrentThreshold = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/alerts/stock-threshold`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Le serveur est la source de vérité unique
        currentThreshold.value = response.data.threshold;
        newThreshold.value = response.data.threshold;
        
        console.log(`✅ Seuil de stock critique chargé depuis le serveur: ${response.data.threshold} unités`);
      } catch (error) {
        console.error('Erreur lors du chargement du seuil:', error);
        // En cas d'erreur, garder la valeur par défaut
        console.warn('⚠️ Utilisation du seuil par défaut:', currentThreshold.value);
      }
    };

    // Mettre à jour le seuil
    const updateThreshold = async () => {
      if (newThreshold.value === currentThreshold.value) return;
      
      isUpdatingThreshold.value = true;
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;
        await axios.put(`${apiUrl}/alerts/stock-threshold`, 
          { threshold: newThreshold.value },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        currentThreshold.value = newThreshold.value;
        
        showSuccess('Configuration mise à jour', `Seuil de stock critique défini à ${newThreshold.value} unités (partagé avec tous les administrateurs)`);
        
        // Actualiser les données pour refléter le nouveau seuil
        if (stockChart.value && stockChart.value.loadStockEvolution) {
          await stockChart.value.loadStockEvolution();
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du seuil:', error);
        showError('Erreur', 'Impossible de mettre à jour le seuil de stock critique');
        newThreshold.value = currentThreshold.value; // Réinitialiser la valeur
      } finally {
        isUpdatingThreshold.value = false;
      }
    };

    onMounted(() => {
      updateLastUpdateTime();
      loadCurrentThreshold();
    });

    return {
      stockChart,
      isRefreshing,
      lastUpdate,
      criticalStockAlerts,
      detailedStats,
      currentThreshold,
      newThreshold,
      isUpdatingThreshold,
      onStockDataLoaded,
      refreshAll,
      generateStockReport,
      updateThreshold
    };
  }
});
</script>

<style scoped>
.stock-dashboard {
  min-height: 100vh;
}
</style> 