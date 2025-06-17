<template>
  <Widget
    :widget-id="widgetId"
    :title="title"
    :is-loading="isLoading"
    :error="error"
    @refresh="$emit('refresh')"
    @close="$emit('close')"
  >
    <div class="grid grid-cols-2 gap-4">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="stat-item text-center p-3 bg-gray-50 rounded-lg"
      >
        <div class="stat-icon text-2xl mb-2">{{ stat.icon }}</div>
        <div class="stat-value text-2xl font-bold text-gray-800">{{ stat.value }}</div>
        <div class="stat-label text-sm text-gray-600">{{ stat.label }}</div>
        <div 
          v-if="stat.change"
          class="stat-change text-xs mt-1"
          :class="{
            'text-green-600': stat.change > 0,
            'text-red-600': stat.change < 0,
            'text-gray-600': stat.change === 0
          }"
        >
          {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
        </div>
      </div>
    </div>
  </Widget>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Widget from './Widget.vue';

interface Stat {
  label: string;
  value: string | number;
  icon: string;
  change?: number;
}

export default defineComponent({
  name: 'StatsWidget',
  components: {
    Widget
  },
  props: {
    widgetId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Statistiques'
    },
    stats: {
      type: Array as PropType<Stat[]>,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['refresh', 'close']
});
</script>

<style scoped>
.stat-item {
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}
</style> 