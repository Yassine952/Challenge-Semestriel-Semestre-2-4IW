<template>
  <div class="compta-dashboard min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent flex items-center">
              💼 Dashboard Comptabilité
            </h1>
            <p class="text-gray-600 mt-2">
              Gestion financière et extraction des factures
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500">
              Dernière mise à jour: {{ lastUpdate }}
            </div>
            <button 
              @click="refreshData"
              :disabled="isRefreshing"
              class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg v-if="isRefreshing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              🔄 Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Statistiques financières -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                💰
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(financialStats.totalRevenue) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                📄
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Factures Générées</p>
              <p class="text-2xl font-bold text-gray-900">{{ financialStats.totalInvoices }}</p>

            </div>
          </div>
        </div>
      </div>

      <!-- Extraction des factures -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-8 mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg">
            📋
          </div>
          Extraction des Factures
        </h3>

        <!-- Filtres d'extraction -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input
              type="date"
              v-model="extractionFilters.startDate"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
            <input
              type="date"
              v-model="extractionFilters.endDate"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-wrap gap-4">
          <button
            @click="extractInvoices"
            :disabled="isExtracting"
            class="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg v-if="isExtracting" class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ isExtracting ? 'Extraction en cours...' : 'Extraire les factures (CSV)' }}
          </button>


        </div>

        <!-- Résumé de l'extraction -->
        <div v-if="extractionSummary" class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 class="font-medium text-blue-900 mb-2">Résumé de l'extraction</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-blue-700">Période:</span>
              <span class="font-medium ml-1">{{ extractionSummary.period }}</span>
            </div>
            <div>
              <span class="text-blue-700">Factures:</span>
              <span class="font-medium ml-1">{{ extractionSummary.count }}</span>
            </div>
            <div>
              <span class="text-blue-700">Montant total:</span>
              <span class="font-medium ml-1">{{ formatCurrency(extractionSummary.totalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphique d'évolution du chiffre d'affaires -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
        <ChartWidget
          widget-id="revenue-chart"
          title="Évolution du Chiffre d'Affaires"
          chart-type="line"
          :chart-data="revenueChartData"
          :is-loading="isLoadingChart"
          :error="chartError"
          :show-type-selector="false"
          @refresh="loadRevenueChart"
          @period-change="(period) => loadRevenueChart(period)"
        />
      </div>


    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useNotifications } from '../composables/useNotifications';
import { comptaService } from '../services/comptaService';
import { dashboardService } from '../services/dashboardService';
import ChartWidget from '../components/widgets/ChartWidget.vue';

export default defineComponent({
  name: 'ComptaDashboard',
  components: {
    ChartWidget
  },
  setup() {
    const { showSuccess, showError, showWarning } = useNotifications();
    
    const isRefreshing = ref(false);
    const isExtracting = ref(false);
    const lastUpdate = ref('');
    
    const financialStats = ref({
      totalRevenue: 0,
      totalInvoices: 0,
      invoicesThisMonth: 0
    });

    const extractionFilters = ref({
      startDate: '',
      endDate: '',
      format: 'csv'
    });

    const extractionSummary = ref(null);

    // Variables pour le graphique
    const revenueChartData = ref({});
    const isLoadingChart = ref(false);
    const chartError = ref('');

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount); // Le montant est déjà en euros
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

    const loadFinancialStats = async () => {
      try {
        const data = await comptaService.getFinancialStats();
        financialStats.value = data;
        updateLastUpdateTime();
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        showError('Erreur', 'Impossible de charger les statistiques financières');
        
        // Données de fallback en cas d'erreur
        financialStats.value = {
          totalRevenue: 0,
          totalInvoices: 0,
          invoicesThisMonth: 0
        };
      }
    };

    const loadRevenueChart = async (period: string = '30d') => {
      isLoadingChart.value = true;
      chartError.value = '';
      try {
        const data = await dashboardService.getRevenueOverTime(period);
        revenueChartData.value = data;
      } catch (error: any) {
        chartError.value = error.response?.data?.message || 'Erreur lors du chargement du graphique des revenus';
      } finally {
        isLoadingChart.value = false;
      }
    };

    const refreshData = async () => {
      isRefreshing.value = true;
      try {
        await Promise.all([
          loadFinancialStats(),
          loadRevenueChart()
        ]);
        showSuccess('Données actualisées', 'Les statistiques ont été mises à jour');
      } catch (error) {
        showError('Erreur', 'Impossible d\'actualiser les données');
      } finally {
        isRefreshing.value = false;
      }
    };

    const extractInvoices = async () => {
      if (!extractionFilters.value.startDate || !extractionFilters.value.endDate) {
        showWarning('Filtres requis', 'Veuillez sélectionner une période pour l\'extraction');
        return;
      }

      isExtracting.value = true;
      try {
        const result = await comptaService.extractInvoices({
          startDate: extractionFilters.value.startDate,
          endDate: extractionFilters.value.endDate,
          format: extractionFilters.value.format as 'csv'
        });
        
        extractionSummary.value = result.summary;
        
        // Vérifier s'il y a des factures dans la période
        if (extractionSummary.value.count === 0) {
          const startDate = new Date(extractionFilters.value.startDate).toLocaleDateString('fr-FR');
          const endDate = new Date(extractionFilters.value.endDate).toLocaleDateString('fr-FR');
          showWarning(
            'Aucune facture trouvée', 
            `Aucune commande n'a été trouvée entre le ${startDate} et le ${endDate}`
          );
          return;
        }
        
        showSuccess('Extraction terminée', `${extractionSummary.value.count} factures extraites en CSV`);
        
        // Proposer le téléchargement sécurisé
        if (result.summary.fileName) {
          try {
            await comptaService.downloadFile(result.summary.fileName);
          } catch (downloadError) {
            console.error('Erreur lors du téléchargement:', downloadError);
            showError('Erreur de téléchargement', 'Impossible de télécharger le fichier');
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'extraction:', error);
        showError('Erreur', 'Impossible d\'extraire les factures');
      } finally {
        isExtracting.value = false;
      }
    };







    // Initialiser les dates par défaut (mois en cours)
    const initDefaultDates = () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      extractionFilters.value.startDate = firstDay.toISOString().split('T')[0];
      extractionFilters.value.endDate = lastDay.toISOString().split('T')[0];
    };

    onMounted(() => {
      loadFinancialStats();
      loadRevenueChart();
      initDefaultDates();
    });

    return {
      isRefreshing,
      isExtracting,
      lastUpdate,
      financialStats,
      extractionFilters,
      extractionSummary,
      revenueChartData,
      isLoadingChart,
      chartError,
      formatCurrency,
      refreshData,
      loadRevenueChart,
      extractInvoices
    };
  }
});
</script>

<style scoped>
.compta-dashboard {
  min-height: 100vh;
}
</style>