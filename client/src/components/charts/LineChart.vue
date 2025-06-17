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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  LineController
} from 'chart.js';

ChartJS.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default defineComponent({
  name: 'LineChart',
  props: {
    data: {
      type: Object as PropType<ChartData<'line'>>,
      required: true
    },
    options: {
      type: Object as PropType<ChartOptions<'line'>>,
      default: () => ({})
    },
    height: {
      type: Number,
      default: 300
    }
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement>();
    let chart: ChartJS<'line'> | null = null;

    const createChart = () => {
      if (!chartCanvas.value) return;

      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

      chart = new ChartJS(ctx, {
        type: 'line',
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
              text: 'Évolution temporelle'
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