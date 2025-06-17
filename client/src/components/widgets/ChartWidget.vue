<template>
  <Widget
    :widget-id="widgetId"
    :title="title"
    :is-loading="isLoading"
    :error="error"
    @refresh="$emit('refresh')"
    @close="$emit('close')"
    content-class="h-80"
  >
    <div class="chart-controls mb-4 flex justify-between items-center">
      <select 
        v-if="showTypeSelector"
        v-model="selectedChartType"
        @change="$emit('chart-type-change', selectedChartType)"
        class="px-3 py-1 border border-gray-300 rounded-md text-sm"
      >
        <option value="line">Ligne</option>
        <option value="bar">Barres</option>
        <option value="doughnut">Donut</option>
      </select>
      
      <select 
        v-if="showPeriodSelector"
        v-model="selectedPeriod"
        @change="$emit('period-change', selectedPeriod)"
        class="px-3 py-1 border border-gray-300 rounded-md text-sm"
      >
        <option value="7d">7 jours</option>
        <option value="30d">30 jours</option>
        <option value="90d">90 jours</option>
        <option value="1y">1 an</option>
      </select>
    </div>

    <div class="chart-container h-64">
      <LineChart 
        v-if="chartType === 'line'" 
        :data="chartData" 
        :options="chartOptions"
      />
      <BarChart 
        v-else-if="chartType === 'bar'" 
        :data="chartData" 
        :options="chartOptions"
      />
      <DoughnutChart 
        v-else-if="chartType === 'doughnut'" 
        :data="chartData" 
        :options="chartOptions"
      />
    </div>
  </Widget>
</template>

<script lang="ts">
import { defineComponent, ref, watch, PropType } from 'vue';
import Widget from './Widget.vue';
import LineChart from '../charts/LineChart.vue';
import BarChart from '../charts/BarChart.vue';
import DoughnutChart from '../charts/DoughnutChart.vue';
import { ChartData, ChartOptions } from 'chart.js';

export default defineComponent({
  name: 'ChartWidget',
  components: {
    Widget,
    LineChart,
    BarChart,
    DoughnutChart
  },
  props: {
    widgetId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Graphique'
    },
    chartType: {
      type: String as PropType<'line' | 'bar' | 'doughnut'>,
      default: 'line'
    },
    chartData: {
      type: Object as PropType<ChartData>,
      required: true
    },
    chartOptions: {
      type: Object as PropType<ChartOptions>,
      default: () => ({})
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    showTypeSelector: {
      type: Boolean,
      default: true
    },
    showPeriodSelector: {
      type: Boolean,
      default: true
    },
    defaultPeriod: {
      type: String,
      default: '30d'
    }
  },
  emits: ['refresh', 'close', 'chart-type-change', 'period-change'],
  setup(props, { emit }) {
    const selectedChartType = ref(props.chartType);
    const selectedPeriod = ref(props.defaultPeriod);

    watch(() => props.chartType, (newType) => {
      selectedChartType.value = newType;
    });

    return {
      selectedChartType,
      selectedPeriod
    };
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style> 