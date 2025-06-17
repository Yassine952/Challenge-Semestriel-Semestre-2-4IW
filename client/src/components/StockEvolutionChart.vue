<template>
  <div class="stock-evolution-chart bg-white shadow-md rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">📊 Évolution des Stocks</h2>
      
      <!-- Sélecteur de période -->
      <div class="flex items-center space-x-4">
        <select 
          v-model="selectedPeriod" 
          @change="loadStockEvolution"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1w">7 derniers jours</option>
          <option value="1m">30 derniers jours</option>
          <option value="3m">3 derniers mois</option>
          <option value="6m">6 derniers mois</option>
          <option value="1y">1 an</option>
        </select>
        
        <button 
          @click="loadStockEvolution"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          <svg v-if="isLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isLoading ? 'Chargement...' : '🔄 Actualiser' }}</span>
        </button>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
      {{ error }}
    </div>

    <!-- Graphique -->
    <div class="chart-container" style="position: relative; height: 400px;">
      <canvas 
        v-if="!isLoading && !error" 
        ref="chartCanvas"
        id="stockEvolutionChart"
      ></canvas>
      
      <!-- Loader -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
      
      <!-- Pas de données -->
      <div v-if="!isLoading && !error && !hasData" class="flex items-center justify-center h-full">
        <div class="text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune donnée disponible</h3>
          <p class="mt-1 text-sm text-gray-500">
            Il n'y a pas de données de stock pour la période sélectionnée.
          </p>
        </div>
      </div>
    </div>

    <!-- Statistiques résumées -->
    <div v-if="!isLoading && !error && hasData" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-sm font-medium text-blue-600">Stock Actuel</div>
        <div class="text-2xl font-bold text-blue-900">{{ currentStock ?? 'N/A' }}</div>
      </div>
      
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="text-sm font-medium text-green-600">Stock Maximum</div>
        <div class="text-2xl font-bold text-green-900">{{ maxStock ?? 'N/A' }}</div>
      </div>
      
      <div class="bg-orange-50 p-4 rounded-lg">
        <div class="text-sm font-medium text-orange-600">Stock Minimum</div>
        <div class="text-2xl font-bold text-orange-900">{{ minStock ?? 'N/A' }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue';
import Chart from 'chart.js/auto';

export default defineComponent({
  name: 'StockEvolutionChart',
  setup() {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const chartInstance = ref<Chart | null>(null);
    const isLoading = ref(false);
    const error = ref('');
    const selectedPeriod = ref('3m');
    const hasData = ref(false);
    const currentStock = ref<number | null>(null);
    const maxStock = ref<number | null>(null);
    const minStock = ref<number | null>(null);

    const loadStockEvolution = async () => {
      isLoading.value = true;
      error.value = '';
      hasData.value = false;
      currentStock.value = null;
      maxStock.value = null;
      minStock.value = null;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/stock/evolution/chart?period=${selectedPeriod.value}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );

        if (response.ok) {
          const chartData = await response.json();
          
          if (chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data.length > 0) {
            hasData.value = true;
            const stockData = chartData.datasets[0].data;
            currentStock.value = stockData[stockData.length - 1];
            maxStock.value = Math.max(...stockData);
            minStock.value = Math.min(...stockData);
            
            await nextTick();
            createChart(chartData);
            console.log('📊 Données réelles chargées depuis l\'API');
            return;
          } else {
            error.value = 'Aucune donnée de stock disponible. Créez des mouvements de stock pour voir le graphique.';
            hasData.value = false;
            return;
          }
        } else {
          error.value = `Erreur API: ${response.status} - ${response.statusText}`;
          hasData.value = false;
          return;
        }

      } catch (err: any) {
        console.error('❌ Erreur lors du chargement des données de stock:', err);
        error.value = `Erreur de connexion: ${err.message}`;
        hasData.value = false;
      } finally {
        isLoading.value = false;
      }
    };

    const createChart = (data: any) => {
      if (!chartCanvas.value) return;
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

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
              text: 'Évolution du Stock Total',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
              callbacks: {
                label: function(context: any) {
                  return `Stock: ${context.parsed.y} unités`;
                }
              }
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Date'
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
                text: 'Quantité en Stock'
              },
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                callback: function(value: any) {
                  return value + ' unités';
                }
              }
            }
          },
          elements: {
            point: {
              radius: 4,
              hoverRadius: 8
            },
            line: {
              tension: 0.4
            }
          }
        }
      });
    };

    onMounted(() => {
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
      currentStock,
      maxStock,
      minStock,
      loadStockEvolution
    };
  }
});
</script>

<style scoped>
.stock-evolution-chart {
  max-width: 100%;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
}
</style> 