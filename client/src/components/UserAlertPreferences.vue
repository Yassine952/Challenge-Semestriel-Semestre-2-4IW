<template>
  <div class="alert-preferences bg-white shadow-md rounded-lg p-6">
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">🔔 Préférences d'Alertes</h2>
    
    <form @submit.prevent="savePreferences" class="space-y-6">
      <!-- Types d'alertes -->
      <div>
        <h3 class="text-lg font-medium mb-4 text-gray-700">Types d'alertes</h3>
        <div class="space-y-3">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="alertNewProducts"
              v-model="preferences.alertNewProducts"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="alertNewProducts" class="ml-2 text-sm text-gray-700">
              <strong>Nouveaux produits</strong> - Recevoir des alertes pour les nouveaux produits
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              type="checkbox"
              id="alertRestock"
              v-model="preferences.alertRestock"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="alertRestock" class="ml-2 text-sm text-gray-700">
              <strong>Réapprovisionnement</strong> - Recevoir des alertes quand un produit est de nouveau en stock
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              type="checkbox"
              id="alertPriceChanges"
              v-model="preferences.alertPriceChanges"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="alertPriceChanges" class="ml-2 text-sm text-gray-700">
              <strong>Changements de prix</strong> - Recevoir des alertes pour les variations de prix
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              type="checkbox"
              id="alertNewsletter"
              v-model="preferences.alertNewsletter"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="alertNewsletter" class="ml-2 text-sm text-gray-700">
              <strong>Newsletter</strong> - Recevoir la newsletter avec les dernières nouveautés
            </label>
          </div>
        </div>
      </div>

      <!-- Catégories d'intérêt -->
      <div>
        <h3 class="text-lg font-medium mb-4 text-gray-700">Catégories d'intérêt</h3>
        <p class="text-sm text-gray-600 mb-3">
          Sélectionnez les catégories pour lesquelles vous souhaitez recevoir des alertes. 
          Si aucune catégorie n'est sélectionnée, vous recevrez des alertes pour toutes les catégories.
        </p>
        
        <div v-if="availableCategories.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div v-for="category in availableCategories" :key="category" class="flex items-center">
            <input
              type="checkbox"
              :id="`category-${category}`"
              v-model="preferences.alertCategories"
              :value="category"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label :for="`category-${category}`" class="ml-2 text-sm text-gray-700">
              {{ category }}
            </label>
          </div>
        </div>
        
        <div v-else class="text-sm text-gray-500">
          Chargement des catégories...
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="flex items-center space-x-4 pt-4">
        <button
          type="submit"
          :disabled="isSaving"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          <svg v-if="isSaving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isSaving ? 'Enregistrement...' : 'Enregistrer les préférences' }}</span>
        </button>
        
        <button
          type="button"
          @click="resetPreferences"
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Réinitialiser
        </button>
      </div>
    </form>

    <!-- Messages de statut -->
    <div v-if="message" :class="messageClass" class="p-4 rounded-md mt-4">
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

interface AlertPreferences {
  alertNewProducts: boolean;
  alertRestock: boolean;
  alertPriceChanges: boolean;
  alertNewsletter: boolean;
  alertCategories: string[];
}

export default defineComponent({
  name: 'UserAlertPreferences',
  setup() {
    const preferences = ref<AlertPreferences>({
      alertNewProducts: true,
      alertRestock: true,
      alertPriceChanges: true,
      alertNewsletter: true,
      alertCategories: []
    });
    
    const originalPreferences = ref<AlertPreferences>({
      alertNewProducts: true,
      alertRestock: true,
      alertPriceChanges: true,
      alertNewsletter: true,
      alertCategories: []
    });
    
    const availableCategories = ref<string[]>([]);
    const isSaving = ref(false);
    const message = ref('');
    const messageClass = ref('');

    const loadPreferences = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-preferences/alerts`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des préférences');
        }

        const data = await response.json();
        preferences.value = { ...data };
        originalPreferences.value = { ...data };
      } catch (error: any) {
        showMessage(error.message || 'Erreur lors du chargement des préférences', 'error');
      }
    };

    const loadCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-preferences/categories`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des catégories');
        }

        const categories = await response.json();
        availableCategories.value = categories;
      } catch (error: any) {
        showMessage(error.message || 'Erreur lors du chargement des catégories', 'error');
      }
    };

    const savePreferences = async () => {
      isSaving.value = true;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-preferences/alerts`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(preferences.value)
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde des préférences');
        }

        const data = await response.json();
        originalPreferences.value = { ...preferences.value };
        showMessage(data.message, 'success');
      } catch (error: any) {
        showMessage(error.message || 'Erreur lors de la sauvegarde des préférences', 'error');
      } finally {
        isSaving.value = false;
      }
    };

    const resetPreferences = () => {
      preferences.value = { ...originalPreferences.value };
      showMessage('Préférences réinitialisées', 'info');
    };

    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
      message.value = msg;
      messageClass.value = type === 'success' 
        ? 'bg-green-100 text-green-800 border border-green-200'
        : type === 'error'
        ? 'bg-red-100 text-red-800 border border-red-200'
        : 'bg-blue-100 text-blue-800 border border-blue-200';
      
      setTimeout(() => {
        message.value = '';
      }, 5000);
    };

    onMounted(() => {
      loadPreferences();
      loadCategories();
    });

    return {
      preferences,
      availableCategories,
      isSaving,
      message,
      messageClass,
      savePreferences,
      resetPreferences
    };
  }
});
</script>

<style scoped>
.alert-preferences {
  max-width: 800px;
}
</style> 