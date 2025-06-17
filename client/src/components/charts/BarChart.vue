<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, PropType } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  BarController
} from 'chart.js';

ChartJS.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default defineComponent({
  name: 'BarChart',
  props: {
    data: {
      type: Object as PropType<ChartData<'bar'>>,
      required: true
    },
    options: {
      type: Object as PropType<ChartOptions<'bar'>>,
      default: () => ({})
    },
    height: {
      type: Number,
      default: 300
    }
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement>();
    let chart: ChartJS<'bar'> | null = null;

    const createChart = () => {
      if (!chartCanvas.value) return;

      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

      chart = new ChartJS(ctx, {
        type: 'bar',
        data: props.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: 'Statistiques'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          },
          ...props.options
        }
      });
    };

    const updateChart = () => {
      if (chart) {
        chart.data = props.data;
        chart.update();
      }
    };

    onMounted(() => {
      createChart();
    });

    watch(() => props.data, updateChart, { deep: true });

    return {
      chartCanvas
    };
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style> 