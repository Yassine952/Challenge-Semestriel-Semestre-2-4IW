<template>
  <div class="fixed top-4 right-4 z-[60] space-y-3 w-auto">
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform translate-x-full scale-95"
      enter-to-class="opacity-100 transform translate-x-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-x-0 scale-100"
      leave-to-class="opacity-0 transform translate-x-full scale-95"
      move-class="transition-transform duration-300"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="max-w-xl w-full bg-white border rounded-lg shadow-xl p-6 cursor-pointer min-w-80"
        :class="{
          'border-green-200 bg-green-50': notification.type === 'success',
          'border-red-200 bg-red-50': notification.type === 'error',
          'border-blue-200 bg-blue-50': notification.type === 'info',
          'border-yellow-200 bg-yellow-50': notification.type === 'warning'
        }"
        @click="removeNotification(notification.id)"
      >
        <div class="flex items-start">
          <!-- Icône -->
          <div class="flex-shrink-0">
            <!-- Success -->
            <svg v-if="notification.type === 'success'" class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <!-- Error -->
            <svg v-else-if="notification.type === 'error'" class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <!-- Warning -->
            <svg v-else-if="notification.type === 'warning'" class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <!-- Info -->
            <svg v-else class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
          </div>
          
          <!-- Contenu -->
          <div class="ml-4 w-0 flex-1">
            <p class="text-base font-semibold" :class="{
              'text-green-800': notification.type === 'success',
              'text-red-800': notification.type === 'error',
              'text-blue-800': notification.type === 'info',
              'text-yellow-800': notification.type === 'warning'
            }">
              {{ notification.title }}
            </p>
            <p v-if="notification.message" class="mt-2 text-sm leading-relaxed" :class="{
              'text-green-700': notification.type === 'success',
              'text-red-700': notification.type === 'error',
              'text-blue-700': notification.type === 'info',
              'text-yellow-700': notification.type === 'warning'
            }">
              {{ notification.message }}
            </p>
          </div>
          
          <!-- Bouton fermer -->
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click.stop="removeNotification(notification.id)"
              class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useNotifications } from '../composables/useNotifications'

export default defineComponent({
  name: 'NotificationContainer',
  setup() {
    const { notifications, removeNotification } = useNotifications()

    return {
      notifications,
      removeNotification
    }
  }
})
</script> 