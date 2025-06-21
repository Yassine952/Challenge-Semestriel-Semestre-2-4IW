<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Header avec avatar -->
    <div class="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center space-x-6">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          <!-- Informations utilisateur -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ user.firstName }} {{ user.lastName }}</h1>
            <p class="text-gray-600">{{ user.email }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Navigation par cartes -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          @click="activeTab = 'profile'"
          :class="[
            'p-6 rounded-2xl border-2 transition-all duration-200 text-left',
            activeTab === 'profile'
              ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
          ]"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Informations personnelles</h3>
              <p class="text-sm text-gray-600">Gérer votre profil</p>
            </div>
          </div>
        </button>

        <button
          @click="activeTab = 'orders'"
          :class="[
            'p-6 rounded-2xl border-2 transition-all duration-200 text-left',
            activeTab === 'orders'
              ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
              : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
          ]"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Mes commandes</h3>
              <p class="text-sm text-gray-600">Historique des achats</p>
            </div>
          </div>
        </button>

        <button
          @click="activeTab = 'alerts'"
          :class="[
            'p-6 rounded-2xl border-2 transition-all duration-200 text-left',
            activeTab === 'alerts'
              ? 'border-green-500 bg-green-50 shadow-lg scale-105'
              : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
          ]"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.5 12.5l3-3 3 3m0-3v8.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Préférences d'alertes</h3>
              <p class="text-sm text-gray-600">Configurer les notifications</p>
            </div>
          </div>
        </button>

        <button
          @click="activeTab = 'notifications'"
          :class="[
            'p-6 rounded-2xl border-2 transition-all duration-200 text-left',
            activeTab === 'notifications'
              ? 'border-orange-500 bg-orange-50 shadow-lg scale-105'
              : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
          ]"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.5 12.5l3-3 3 3m0-3v8.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Historique des notifications</h3>
              <p class="text-sm text-gray-600">Voir toutes vos notifications</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Contenu des onglets -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-8">
        <!-- Onglet Profil -->
        <div v-if="activeTab === 'profile'">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Informations personnelles</h2>
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Sécurisé
            </div>
          </div>
          
          <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input 
                  type="text" 
                  v-model="user.firstName" 
                  required 
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Votre prénom"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom de famille</label>
                <input 
                  type="text" 
                  v-model="user.lastName" 
                  required 
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
              <input 
                type="email" 
                v-model="user.email" 
                readonly 
                class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="votre@email.com"
              />
              <p class="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Adresse de livraison</label>
              <textarea 
                v-model="user.shippingAddress" 
                required 
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="123 Rue de la Paix, 75001 Paris, France"
              ></textarea>
            </div>

            <div class="flex justify-end">
              <button 
                type="submit" 
                :disabled="isUpdating"
                class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg v-if="isUpdating" class="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isUpdating ? 'Mise à jour...' : 'Sauvegarder les modifications' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Onglet Commandes -->
        <div v-if="activeTab === 'orders'">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Mes commandes</h2>
            <p class="text-gray-600">Consultez l'historique de vos achats et suivez vos commandes</p>
          </div>
          <OrderList />
        </div>

        <!-- Onglet Alertes -->
        <div v-if="activeTab === 'alerts'">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Préférences d'alertes</h2>
            <p class="text-gray-600">Configurez vos notifications pour rester informé</p>
          </div>
          <UserAlertPreferences />
        </div>

        <!-- Onglet Notifications -->
        <div v-if="activeTab === 'notifications'">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Historique des notifications</h2>
            <p class="text-gray-600">Consultez toutes vos notifications passées et actuelles</p>
          </div>
          <NotificationHistory />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { fetchUserProfile } from '../services/userService';
import { User } from '../types/User';
import OrderList from './OrderList.vue';
import UserAlertPreferences from '../components/UserAlertPreferences.vue';
import NotificationHistory from '../components/NotificationHistory.vue';
import { useNotifications } from '../composables/useNotifications';

export default defineComponent({
  name: 'Profile',
  components: {
    OrderList,
    UserAlertPreferences,
    NotificationHistory
  },
  setup() {
    const { showSuccess, showError } = useNotifications();
    const activeTab = ref('profile');
    const isUpdating = ref(false);
    const user = reactive<User>({
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      shippingAddress: ''
    });

    const fetchProfile = async () => {
      try {
        const response = await fetchUserProfile();
        Object.assign(user, response);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        showError('Erreur', 'Impossible de charger votre profil');
      }
    };

    const updateProfile = async () => {
      isUpdating.value = true;
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/profile`, user, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        showSuccess('Profil mis à jour', 'Vos informations ont été sauvegardées avec succès');
      } catch (err) {
        console.error('Failed to update profile', err);
        showError('Erreur', 'Impossible de mettre à jour votre profil');
      } finally {
        isUpdating.value = false;
      }
    };

    const handleSwitchToNotifications = () => {
      activeTab.value = 'notifications';
    };

    onMounted(() => {
      fetchProfile();
      window.addEventListener('switchToNotificationsTab', handleSwitchToNotifications);
    });

    onUnmounted(() => {
      window.removeEventListener('switchToNotificationsTab', handleSwitchToNotifications);
    });

    return { 
      activeTab,
      user,
      isUpdating,
      updateProfile 
    };
  }
});
</script>

<style scoped>
/* Animations personnalisées */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-content > div {
  animation: slideIn 0.3s ease-out;
}
</style>
