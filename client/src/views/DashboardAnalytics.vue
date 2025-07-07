<template>
  <div class="dashboard-analytics min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Dashboard Analytics</h1>
            <p class="text-gray-600 mt-1">Vue d'ensemble des performances de votre e-commerce</p>
          </div>
          
          <div class="flex gap-4">
            <select 
              v-model="globalPeriod"
              @change="refreshAllWidgets"
              class="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="5m">5 dernières minutes</option>
              <option value="1h">1 dernière heure</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
            </select>
            
            <button 
              @click="toggleCustomizeMode"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {{ isCustomizing ? '✓ Terminer' : '⚙️ Personnaliser' }}
            </button>
            
            <button 
              @click="refreshAllWidgets"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>
      </div>

      <!-- Widget Palette (visible en mode personnalisation) -->
      <div v-if="isCustomizing" class="mb-6 p-4 bg-white rounded-lg shadow-md border-2 border-dashed border-blue-300">
        <h3 class="text-lg font-semibold mb-3">Widgets disponibles</h3>
        <div class="flex flex-wrap gap-3">
          <button 
            v-for="widgetType in availableWidgets"
            :key="widgetType.id"
            @click="addWidget(widgetType)"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
            :disabled="activeWidgets.some(w => w.id === widgetType.id)"
          >
            {{ widgetType.icon }} {{ widgetType.name }}
          </button>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div 
        class="dashboard-grid grid gap-6"
        :class="gridClass"
        @drop="onDrop"
        @dragover.prevent
        @dragenter.prevent
      >
        <!-- Stats Widget -->
        <div 
          v-if="isWidgetActive('stats')"
          class="widget-container"
          :class="{ 'widget-customizing': isCustomizing }"
        >
          <StatsWidget
            widget-id="stats"
            title="Statistiques Générales"
            :stats="statsData"
            :is-loading="loadingStates.stats"
            :error="errorStates.stats"
            @refresh="loadStats"
            @close="removeWidget('stats')"
          />
        </div>

        <!-- Orders Over Time Chart -->
        <div 
          v-if="isWidgetActive('orders-chart')"
          class="widget-container col-span-2"
          :class="{ 'widget-customizing': isCustomizing }"
        >
          <ChartWidget
            widget-id="orders-chart"
            title="Évolution des Commandes"
            chart-type="line"
            :chart-data="ordersChartData"
            :is-loading="loadingStates.ordersChart"
            :error="errorStates.ordersChart"
            :show-type-selector="false"
            @refresh="loadOrdersChart"
            @close="removeWidget('orders-chart')"
            @period-change="(period) => loadOrdersChart(period)"
          />
        </div>

        <!-- Revenue Over Time Chart -->
        <div 
          v-if="isWidgetActive('revenue-chart')"
          class="widget-container col-span-2"
          :class="{ 'widget-customizing': isCustomizing }"
        >
          <ChartWidget
            widget-id="revenue-chart"
            title="Évolution du Chiffre d'Affaires"
            chart-type="line"
            :chart-data="revenueChartData"
            :is-loading="loadingStates.revenueChart"
            :error="errorStates.revenueChart"
            :show-type-selector="false"
            @refresh="loadRevenueChart"
            @close="removeWidget('revenue-chart')"
            @period-change="(period) => loadRevenueChart(period)"
          />
        </div>

        <!-- Stock Evolution Chart -->
        <div 
          v-if="isWidgetActive('stock-evolution')"
          class="widget-container col-span-2"
          :class="{ 'widget-customizing': isCustomizing }"
        >
          <div class="widget-header">
            <button 
              v-if="isCustomizing"
              @click="removeWidget('stock-evolution')"
              class="widget-close-btn"
            >
              ✕
            </button>
          </div>
          <StockEvolutionChart />
        </div>

        <!-- Order Status Distribution -->
        <div 
          v-if="isWidgetActive('order-status')"
          class="widget-container"
          :class="{ 'widget-customizing': isCustomizing }"
        >
          <ChartWidget
            widget-id="order-status"
            title="Statut des Commandes"
            chart-type="doughnut"
            :chart-data="orderStatusData"
            :is-loading="loadingStates.orderStatus"
            :error="errorStates.orderStatus"
            :show-type-selector="false"
            :show-period-selector="false"
            @refresh="loadOrderStatus"
            @close="removeWidget('order-status')"
          />
        </div>

        <!-- Top Products -->
        <div 
          v-if="isWidgetActive('top-products')"
          class="widget-container"
          :class="{ 'widget-customizing': isCustomizing }"
        >
          <ChartWidget
            widget-id="top-products"
            title="Produits les Plus Vendus"
            chart-type="bar"
            :chart-data="topProductsData"
            :is-loading="loadingStates.topProducts"
            :error="errorStates.topProducts"
            :show-type-selector="false"
            @refresh="loadTopProducts"
            @close="removeWidget('top-products')"
            @period-change="(period) => loadTopProducts(period)"
          />
        </div>

        <!-- Revenue by Category -->
        <div 
          v-if="isWidgetActive('revenue-category')"
          class="widget-container"
          :class="{ 'widget-customizing': isCustomizing }"
        >
          <ChartWidget
            widget-id="revenue-category"
            title="CA par Catégorie"
            chart-type="doughnut"
            :chart-data="revenueCategoryData"
            :is-loading="loadingStates.revenueCategory"
            :error="errorStates.revenueCategory"
            :show-type-selector="false"
            @refresh="loadRevenueByCategory"
            @close="removeWidget('revenue-category')"
            @period-change="(period) => loadRevenueByCategory(period)"
          />
        </div>

        <!-- Users Over Time -->
        <div 
          v-if="isWidgetActive('users-chart')"
          class="widget-container col-span-2"
          :class="{ 'widget-customizing': isCustomizing }"
        >
          <ChartWidget
            widget-id="users-chart"
            title="Évolution des Utilisateurs"
            chart-type="line"
            :chart-data="usersChartData"
            :is-loading="loadingStates.usersChart"
            :error="errorStates.usersChart"
            :show-type-selector="false"
            @refresh="loadUsersChart"
            @close="removeWidget('users-chart')"
            @period-change="(period) => loadUsersChart(period)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import StatsWidget from '../components/widgets/StatsWidget.vue';
import ChartWidget from '../components/widgets/ChartWidget.vue';
import StockEvolutionChart from '../components/StockEvolutionChart.vue';
import { dashboardService, type DashboardStats } from '../services/dashboardService';
import { ChartData } from 'chart.js';

interface DecodedToken {
  role: string;
  userId: number;
}

interface WidgetType {
  id: string;
  name: string;
  icon: string;
  component: string;
}

interface ActiveWidget {
  id: string;
  position: number;
}

export default defineComponent({
  name: 'DashboardAnalytics',
  components: {
    StatsWidget,
    ChartWidget,
    StockEvolutionChart
  },
  setup() {
    const router = useRouter();

    // État global
    const globalPeriod = ref('30d');
    const isCustomizing = ref(false);

    // Widgets disponibles
    const availableWidgets: WidgetType[] = [
      { id: 'stats', name: 'Statistiques', icon: '📊', component: 'StatsWidget' },
      { id: 'orders-chart', name: 'Commandes', icon: '📈', component: 'ChartWidget' },
      { id: 'revenue-chart', name: 'Chiffre d\'affaires', icon: '💰', component: 'ChartWidget' },
      { id: 'stock-evolution', name: 'Évolution des Stocks', icon: '📦', component: 'StockEvolutionChart' },
      { id: 'order-status', name: 'Statut commandes', icon: '🔄', component: 'ChartWidget' },
      { id: 'top-products', name: 'Top produits', icon: '🏆', component: 'ChartWidget' },
      { id: 'revenue-category', name: 'CA par catégorie', icon: '🎯', component: 'ChartWidget' },
      { id: 'users-chart', name: 'Utilisateurs', icon: '👥', component: 'ChartWidget' }
    ];

    // Widgets actifs (sauvegardés dans localStorage)
    const activeWidgets = ref<ActiveWidget[]>([
      { id: 'stats', position: 0 },
      { id: 'orders-chart', position: 1 },
      { id: 'revenue-chart', position: 2 },
      { id: 'order-status', position: 3 }
    ]);

    // États de chargement et d'erreur
    const loadingStates = reactive({
      stats: false,
      ordersChart: false,
      revenueChart: false,
      orderStatus: false,
      topProducts: false,
      revenueCategory: false,
      usersChart: false
    });

    const errorStates = reactive({
      stats: '',
      ordersChart: '',
      revenueChart: '',
      orderStatus: '',
      topProducts: '',
      revenueCategory: '',
      usersChart: ''
    });

    // Données des widgets
    const statsData = ref<Array<{label: string, value: string | number, icon: string, change?: number}>>([]);
    const ordersChartData = ref<ChartData>({ labels: [], datasets: [] });
    const revenueChartData = ref<ChartData>({ labels: [], datasets: [] });
    const orderStatusData = ref<ChartData>({ labels: [], datasets: [] });
    const topProductsData = ref<ChartData>({ labels: [], datasets: [] });
    const revenueCategoryData = ref<ChartData>({ labels: [], datasets: [] });
    const usersChartData = ref<ChartData>({ labels: [], datasets: [] });

    // Computed
    const gridClass = computed(() => {
      return isCustomizing.value 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    });

    // Méthodes
    const isWidgetActive = (widgetId: string): boolean => {
      return activeWidgets.value.some(w => w.id === widgetId);
    };

    const addWidget = (widgetType: WidgetType) => {
      if (!isWidgetActive(widgetType.id)) {
        activeWidgets.value.push({
          id: widgetType.id,
          position: activeWidgets.value.length
        });
        saveWidgetConfiguration();
        loadWidgetData(widgetType.id);
      }
    };

    const removeWidget = (widgetId: string) => {
      activeWidgets.value = activeWidgets.value.filter(w => w.id !== widgetId);
      saveWidgetConfiguration();
    };

    const toggleCustomizeMode = () => {
      isCustomizing.value = !isCustomizing.value;
    };

    const saveWidgetConfiguration = () => {
      localStorage.setItem('dashboard-widgets', JSON.stringify(activeWidgets.value));
    };

    const loadWidgetConfiguration = () => {
      const saved = localStorage.getItem('dashboard-widgets');
      if (saved) {
        activeWidgets.value = JSON.parse(saved);
      }
    };

    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      // Logique de réorganisation des widgets
    };

    // Chargement des données
    const loadStats = async (period: string = globalPeriod.value) => {
      loadingStates.stats = true;
      errorStates.stats = '';
      try {
        const data = await dashboardService.getStats(period);
        statsData.value = [
          { label: 'Commandes', value: data.totalOrders, icon: '📦', change: data.ordersChange },
          { label: 'Chiffre d\'affaires', value: `${data.totalRevenue}€`, icon: '💰', change: data.revenueChange },
          { label: 'Utilisateurs', value: data.totalUsers, icon: '👥', change: data.usersChange },
          { label: 'Produits', value: data.totalProducts, icon: '📦', change: data.productsChange }
        ];
      } catch (error: any) {
        errorStates.stats = error.response?.data?.message || 'Erreur lors du chargement des statistiques';
      } finally {
        loadingStates.stats = false;
      }
    };

    const loadOrdersChart = async (period: string = globalPeriod.value) => {
      loadingStates.ordersChart = true;
      errorStates.ordersChart = '';
      try {
        const data = await dashboardService.getOrdersOverTime(period);
        ordersChartData.value = data;
      } catch (error: any) {
        errorStates.ordersChart = error.response?.data?.message || 'Erreur lors du chargement du graphique des commandes';
      } finally {
        loadingStates.ordersChart = false;
      }
    };

    const loadRevenueChart = async (period: string = globalPeriod.value) => {
      loadingStates.revenueChart = true;
      errorStates.revenueChart = '';
      try {
        const data = await dashboardService.getRevenueOverTime(period);
        revenueChartData.value = data;
      } catch (error: any) {
        errorStates.revenueChart = error.response?.data?.message || 'Erreur lors du chargement du graphique des revenus';
      } finally {
        loadingStates.revenueChart = false;
      }
    };

    const loadOrderStatus = async (period: string = globalPeriod.value) => {
      loadingStates.orderStatus = true;
      errorStates.orderStatus = '';
      try {
        const data = await dashboardService.getOrderStatusDistribution(period);
        orderStatusData.value = data;
      } catch (error: any) {
        errorStates.orderStatus = error.response?.data?.message || 'Erreur lors du chargement du statut des commandes';
      } finally {
        loadingStates.orderStatus = false;
      }
    };

    const loadTopProducts = async (period: string = globalPeriod.value) => {
      loadingStates.topProducts = true;
      errorStates.topProducts = '';
      try {
        const data = await dashboardService.getTopProducts(period);
        topProductsData.value = data;
      } catch (error: any) {
        errorStates.topProducts = error.response?.data?.message || 'Erreur lors du chargement des top produits';
      } finally {
        loadingStates.topProducts = false;
      }
    };

    const loadRevenueByCategory = async (period: string = globalPeriod.value) => {
      loadingStates.revenueCategory = true;
      errorStates.revenueCategory = '';
      try {
        const data = await dashboardService.getRevenueByCategory(period);
        revenueCategoryData.value = data;
      } catch (error: any) {
        errorStates.revenueCategory = error.response?.data?.message || 'Erreur lors du chargement du CA par catégorie';
      } finally {
        loadingStates.revenueCategory = false;
      }
    };

    const loadUsersChart = async (period: string = globalPeriod.value) => {
      loadingStates.usersChart = true;
      errorStates.usersChart = '';
      try {
        const data = await dashboardService.getUsersOverTime(period);
        usersChartData.value = data;
      } catch (error: any) {
        errorStates.usersChart = error.response?.data?.message || 'Erreur lors du chargement du graphique des utilisateurs';
      } finally {
        loadingStates.usersChart = false;
      }
    };

    const loadWidgetData = (widgetId: string, period: string = globalPeriod.value) => {
      switch (widgetId) {
        case 'stats':
          loadStats(period);
          break;
        case 'orders-chart':
          loadOrdersChart(period);
          break;
        case 'revenue-chart':
          loadRevenueChart(period);
          break;
        case 'order-status':
          loadOrderStatus(period);
          break;
        case 'top-products':
          loadTopProducts(period);
          break;
        case 'revenue-category':
          loadRevenueByCategory(period);
          break;
        case 'users-chart':
          loadUsersChart(period);
          break;
      }
    };

    const refreshAllWidgets = () => {
      activeWidgets.value.forEach(widget => {
        loadWidgetData(widget.id, globalPeriod.value);
      });
    };

    // Vérification des permissions
    onMounted(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        if (decoded.role !== 'ROLE_ADMIN') {
          router.push('/');
          return;
        }
      } catch (error) {
        router.push('/login');
        return;
      }

      loadWidgetConfiguration();
      refreshAllWidgets();
    });

    return {
      // État
      globalPeriod,
      isCustomizing,
      availableWidgets,
      activeWidgets,
      loadingStates,
      errorStates,
      
      // Données
      statsData,
      ordersChartData,
      revenueChartData,
      orderStatusData,
      topProductsData,
      revenueCategoryData,
      usersChartData,
      
      // Computed
      gridClass,
      
      // Méthodes
      isWidgetActive,
      addWidget,
      removeWidget,
      toggleCustomizeMode,
      onDrop,
      loadStats,
      loadOrdersChart,
      loadRevenueChart,
      loadOrderStatus,
      loadTopProducts,
      loadRevenueByCategory,
      loadUsersChart,
      refreshAllWidgets
    };
  }
});
</script>

<style scoped>
.dashboard-grid {
  min-height: 400px;
}

.widget-container {
  transition: all 0.3s ease;
}

.widget-customizing {
  border: 2px dashed #3b82f6;
  border-radius: 8px;
}

.widget-customizing:hover {
  border-color: #1d4ed8;
  background-color: rgba(59, 130, 246, 0.05);
}
</style> 