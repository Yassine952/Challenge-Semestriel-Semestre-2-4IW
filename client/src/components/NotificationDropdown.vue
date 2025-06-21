<template>
  <div class="relative">
    <!-- Bouton de notification -->
    <button 
      @click="toggleDropdown"
      class="relative p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.5 12.5l3-3 3 3m0-3v8.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      
      <!-- Badge de notification -->
      <span 
        v-if="unreadCount > 0" 
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown des notifications -->
    <div 
      v-if="isOpen"
      class="absolute top-full right-0 mt-2 w-80 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 z-50"
      @click.stop
    >
      <!-- Header -->
      <div class="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Notifications</h3>
          <div class="flex items-center space-x-2">
            <button
              @click="refreshNotifications"
              :disabled="isLoading"
              class="p-1 text-neutral-500 hover:text-neutral-700 transition-colors disabled:opacity-50"
              title="Actualiser"
            >
              <svg :class="['w-4 h-4', isLoading ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
            <button 
              v-if="notifications.length > 0 && unreadCount > 0"
              @click="markAllAsRead"
              class="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Tout marquer comme lu
            </button>
          </div>
        </div>
      </div>

      <!-- Liste des notifications -->
      <div class="max-h-96 overflow-y-auto">
        <div v-if="isLoading" class="p-6 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p class="text-neutral-500 dark:text-neutral-400">Chargement...</p>
        </div>

        <div v-else-if="notifications.length === 0" class="p-6 text-center">
          <svg class="w-12 h-12 mx-auto text-neutral-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-neutral-500 dark:text-neutral-400">Aucune notification</p>
        </div>

        <div v-else>
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            :class="[
              'p-4 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer',
              !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
            ]"
            @click="markAsRead(notification.id)"
          >
            <div class="flex items-start space-x-3">
              <!-- Icône selon le type -->
              <div :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                getNotificationStyle(notification.alertType)
              ]">
                <span class="text-sm">{{ getAlertTypeIcon(notification.alertType) }}</span>
              </div>

              <!-- Contenu -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {{ notification.title }}
                </p>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {{ notification.message }}
                </p>
                
                <!-- Informations produit si disponibles -->
                <div v-if="notification.Product" class="mt-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">{{ notification.Product.name }}</span>
                    <span class="text-blue-600 font-bold">{{ (notification.Product.price / 100).toFixed(2) }}€</span>
                  </div>
                </div>
                
                <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                  {{ formatTime(notification.createdAt) }}
                </p>
              </div>

              <!-- Indicateur non lu -->
              <div v-if="!notification.isRead" class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="notifications.length > 0" class="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <router-link 
          to="/profile"
          @click="closeDropdown(); navigateToNotifications()"
          class="block w-full text-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          Voir toutes les notifications
        </router-link>
      </div>
    </div>

    <!-- Overlay pour fermer le dropdown -->
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

interface AlertHistoryItem {
  id: number;
  alertType: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
  Product?: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
}

export default defineComponent({
  name: 'NotificationDropdown',
  setup() {
    const router = useRouter();
    const isOpen = ref(false);
    const isLoading = ref(false);
    const notifications = ref<AlertHistoryItem[]>([]);

    const unreadCount = computed(() => 
      notifications.value.filter(n => !n.isRead).length
    );

    const loadNotifications = async () => {
      if (!localStorage.getItem('token')) return;
      
      isLoading.value = true;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-preferences/alerts/history?limit=5`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          notifications.value = data.alerts || [];
          console.log('Notifications chargées:', data.alerts?.length || 0);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const refreshNotifications = async () => {
      await loadNotifications();
    };

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
      if (isOpen.value) {
        // Toujours recharger les notifications à l'ouverture
        loadNotifications();
      }
    };

    const closeDropdown = () => {
      isOpen.value = false;
    };

    const navigateToNotifications = () => {
      // Utiliser un setTimeout pour permettre à Vue Router de naviguer d'abord
      setTimeout(() => {
        // Déclencher un événement personnalisé pour changer l'onglet actif
        window.dispatchEvent(new CustomEvent('switchToNotificationsTab'));
      }, 100);
    };

    const markAsRead = async (id: number) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-preferences/alerts/${id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const notification = notifications.value.find(n => n.id === id);
          if (notification) {
            notification.isRead = true;
          }
        }
      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error);
      }
    };

    const markAllAsRead = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-preferences/alerts/mark-all-read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          notifications.value.forEach(n => n.isRead = true);
        }
      } catch (error) {
        console.error('Erreur lors du marquage global:', error);
      }
    };

    const getNotificationStyle = (type: string) => {
      const styles = {
        new_product: 'bg-green-100 text-green-600',
        restock: 'bg-blue-100 text-blue-600',
        price_change: 'bg-orange-100 text-orange-600',
        newsletter: 'bg-purple-100 text-purple-600'
      };
      return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-600';
    };

    const getAlertTypeIcon = (type: string) => {
      const icons = {
        new_product: '🆕',
        restock: '📦',
        price_change: '💰',
        newsletter: '📰'
      };
      return icons[type as keyof typeof icons] || '🔔';
    };

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 60) {
        return `Il y a ${minutes} min`;
      } else if (hours < 24) {
        return `Il y a ${hours}h`;
      } else {
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
      }
    };

    // Fermer le dropdown avec Escape
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    // Interval pour rafraîchir automatiquement les notifications
    let refreshInterval: NodeJS.Timeout | null = null;

    onMounted(() => {
      document.addEventListener('keydown', handleKeydown);
      // Charger les notifications au montage si l'utilisateur est connecté
      if (localStorage.getItem('token')) {
        loadNotifications();
        // Rafraîchir automatiquement toutes les 30 secondes
        refreshInterval = setInterval(() => {
          if (localStorage.getItem('token')) {
            loadNotifications();
          }
        }, 30000);
      }
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown);
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    });

    return {
      isOpen,
      isLoading,
      notifications,
      unreadCount,
      toggleDropdown,
      closeDropdown,
      navigateToNotifications,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      getNotificationStyle,
      getAlertTypeIcon,
      formatTime
    };
  }
});
</script> 