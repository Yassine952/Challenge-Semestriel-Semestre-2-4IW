<template>
  <div 
    class="widget bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
    :class="{ 'cursor-move': isDraggable }"
    :draggable="isDraggable"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="widget-header flex justify-between items-center mb-3">
      <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
      <div class="widget-actions flex gap-2">
        <button 
          v-if="showRefresh"
          @click="$emit('refresh')"
          class="p-1 text-gray-500 hover:text-blue-600 transition-colors"
          title="Actualiser"
        >
          🔄
        </button>
        <button 
          v-if="showSettings"
          @click="$emit('settings')"
          class="p-1 text-gray-500 hover:text-blue-600 transition-colors"
          title="Paramètres"
        >
          ⚙️
        </button>
        <button 
          v-if="showClose"
          @click="$emit('close')"
          class="p-1 text-gray-500 hover:text-red-600 transition-colors"
          title="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
    
    <div class="widget-content" :class="contentClass">
      <div v-if="isLoading" class="flex justify-center items-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="error" class="text-red-600 text-center py-4">
        {{ error }}
      </div>
      <slot v-else></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Widget',
  props: {
    title: {
      type: String,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    isDraggable: {
      type: Boolean,
      default: true
    },
    showRefresh: {
      type: Boolean,
      default: true
    },
    showSettings: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: true
    },
    contentClass: {
      type: String,
      default: ''
    },
    widgetId: {
      type: String,
      required: true
    }
  },
  emits: ['refresh', 'settings', 'close', 'dragstart', 'dragend'],
  setup(props, { emit }) {
    const onDragStart = (event: DragEvent) => {
      if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', props.widgetId);
        event.dataTransfer.effectAllowed = 'move';
      }
      emit('dragstart', props.widgetId);
    };

    const onDragEnd = () => {
      emit('dragend', props.widgetId);
    };

    return {
      onDragStart,
      onDragEnd
    };
  }
});
</script>

<style scoped>
.widget {
  min-height: 200px;
}

.widget-content {
  min-height: 150px;
}
</style> 