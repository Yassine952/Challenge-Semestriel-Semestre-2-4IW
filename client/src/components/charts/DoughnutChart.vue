<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, PropType } from 'vue';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  DoughnutController
} from 'chart.js';

ChartJS.register(
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
);

export default defineComponent({
  name: 'DoughnutChart',
  props: {
    data: {
      type: Object as PropType<ChartData<'doughnut'>>,
      required: true
    },
    options: {
      type: Object as PropType<ChartOptions<'doughnut'>>,
      default: () => ({})
    },
    height: {
      type: Number,
      default: 300
    }
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement>();
    let chart: ChartJS<'doughnut'> | null = null;

    const createChart = () => {
      if (!chartCanvas.value) return;

      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

      chart = new ChartJS(ctx, {
        type: 'doughnut',
        data: props.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right' as const,
            },
            title: {
              display: true,
              text: 'Répartition'
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