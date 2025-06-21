<template>
  <div class="stock-evolution-chart bg-white shadow-md rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-gray-800 flex items-center">
        📈 Évolution des Stocks par Produit
      </h3>
      <div class="flex items-center space-x-4">
        <select 
          v-model="selectedPeriod" 
          @change="loadStockEvolution"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="5m">5 dernières minutes</option>
          <option value="1h">1 heure</option>
          <option value="1d">1 jour</option>
          <option value="1w">1 semaine</option>
          <option value="1m">1 mois</option>
          <option value="3m">3 derniers mois</option>
          <option value="6m">6 derniers mois</option>
          <option value="1y">1 année</option>
        </select>
        <button 
          @click="loadStockEvolution"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
      {{ error }}
    </div>

    <!-- Graphique -->
    <div v-if="hasData && !isLoading" class="chart-container">
      <canvas ref="chartCanvas" width="800" height="400"></canvas>
    </div>

    <!-- Message de chargement -->
    <div v-else-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Message aucune donnée -->
    <div v-else class="flex justify-center items-center h-64 text-gray-500">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune donnée disponible</h3>
        <p class="mt-1 text-sm text-gray-500">Effectuez des transactions pour voir l'évolution des stocks.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default defineComponent({
  name: 'StockEvolutionChart',
  emits: ['data-loaded'],
  setup(props, { emit }) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const chartInstance = ref<Chart | null>(null);
    const isLoading = ref(false);
    const error = ref('');
    const selectedPeriod = ref('1h');
    const hasData = ref(false);
    const productsInfo = ref<Array<{name: string, currentStock: number}>>([]);

    // Seuil de stock faible
    let LOW_STOCK_THRESHOLD = 10;

const isLowStock = (stock: number) => stock <= LOW_STOCK_THRESHOLD;

    const loadStockEvolution = async () => {
      isLoading.value = true;
      error.value = '';
      hasData.value = false;
      productsInfo.value = [];

      try {
        // Charger le seuil actuel depuis le serveur (source de vérité globale)
        try {
          const thresholdResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/alerts/stock-threshold`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              }
            }
          );
          if (thresholdResponse.ok) {
            const thresholdData = await thresholdResponse.json();
            LOW_STOCK_THRESHOLD = thresholdData.threshold;
            console.log(`📊 Seuil de stock pour le graphique: ${LOW_STOCK_THRESHOLD} unités`);
          }
        } catch (error) {
          console.warn('Impossible de charger le seuil depuis le serveur, utilisation de la valeur par défaut:', LOW_STOCK_THRESHOLD);
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/stock/evolution-chart?period=${selectedPeriod.value}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );

        if (response.ok) {
          const chartData = await response.json();
          console.log('🔍 Données reçues:', chartData);
          
          if (chartData.datasets && chartData.datasets.length > 0) {
            hasData.value = true;
            
            // Récupérer les informations sur les produits
            if (chartData.productsInfo) {
              productsInfo.value = chartData.productsInfo;
            }
            
            await nextTick();
            setTimeout(() => {
              createChart(chartData);
              console.log('📊 Graphique créé avec', chartData.datasets.length, 'produits');
            }, 100);
            
            emit('data-loaded', { productsInfo: productsInfo.value });
          } else {
            error.value = 'Aucun produit trouvé pour générer le graphique.';
            hasData.value = false;
          }
        } else {
          error.value = `Erreur API: ${response.status} - ${response.statusText}`;
          hasData.value = false;
        }

      } catch (err: any) {
        console.error('❌ Erreur lors du chargement:', err);
        error.value = `Erreur de connexion: ${err.message}`;
        hasData.value = false;
      } finally {
        isLoading.value = false;
      }
    };

    const createChart = (data: any) => {
      console.log('🎨 Création du graphique');
      
      if (!chartCanvas.value) {
        console.error('❌ Canvas non trouvé');
        return;
      }

      // Détruire le graphique existant de manière sécurisée
      if (chartInstance.value) {
        try {
          chartInstance.value.destroy();
        } catch (destroyError) {
          console.warn('⚠️ Erreur lors de la destruction du graphique:', destroyError);
        }
        chartInstance.value = null;
      }

      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) {
        console.error('❌ Contexte 2D non disponible');
        return;
      }

      // Vérifier que le canvas est toujours dans le DOM
      if (!chartCanvas.value.isConnected) {
        console.error('❌ Canvas déconnecté du DOM');
        return;
      }

      try {
        chartInstance.value = new Chart(ctx, {
          type: 'line',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'index'
            },
            plugins: {
              title: {
                display: true,
                text: `Évolution des Stocks par Produit (${selectedPeriod.value.toUpperCase()})`,
                font: {
                  size: 16,
                  weight: 'bold'
                }
              },
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              },
              tooltip: {
                callbacks: {
                  title: function(context: any) {
                    return `Période: ${context[0].label}`;
                  },
                  label: function(context: any) {
                    return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} unités`;
                  }
                }
              }
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: '⏰ Période',
                  font: {
                    weight: 'bold',
                    size: 12
                  }
                },
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: '📦 Quantité en Stock',
                  font: {
                    weight: 'bold',
                    size: 12
                  }
                },
                beginAtZero: true,
                min: 0,
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                  callback: function(value: any) {
                    return value >= 0 ? value.toLocaleString() + ' unités' : '';
                  }
                }
              }
            }
          }
        });

        console.log('✅ Graphique créé avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de la création du graphique:', error);
      }
    };

    onMounted(() => {
      console.log('🚀 Composant monté, chargement des données...');
      loadStockEvolution();
    });

    onUnmounted(() => {
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }
    });

    return {
      chartCanvas,
      isLoading,
      error,
      selectedPeriod,
      hasData,
      productsInfo,
      isLowStock,
      loadStockEvolution
    };
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

.chart-container canvas {
  max-height: 400px;
}
</style> 