<template>
  <div class="max-w-screen-xl mx-auto px-4 md:px-8 py-10">
    <div class="max-w-lg sm:mx-auto sm:text-center mb-8">
      <h3 class="text-gray-800 text-4xl font-semibold sm:text-5xl mb-2">
        🎫 Gestion des Promotions
      </h3>
      <p class="leading-relaxed text-gray-600 text-[15px]">
        Créez et gérez vos codes promo et promotions.
      </p>
    </div>

    <!-- Filtres et actions -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex space-x-4">
        <button
          @click="filterType = 'all'"
          :class="filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="px-4 py-2 rounded-md transition-colors"
        >
          Toutes ({{ promotions.length }})
        </button>
        <button
          @click="filterType = 'active'"
          :class="filterType === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="px-4 py-2 rounded-md transition-colors"
        >
          Actives ({{ activePromotions.length }})
        </button>
        <button
          @click="filterType = 'expired'"
          :class="filterType === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="px-4 py-2 rounded-md transition-colors"
        >
          Expirées ({{ expiredPromotions.length }})
        </button>
      </div>
      
      <router-link 
        to="/add-promotion" 
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        <span>Nouvelle Promotion</span>
      </router-link>
    </div>

    <!-- Liste des promotions -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Chargement des promotions...</p>
    </div>

    <div v-else-if="filteredPromotions.length === 0" class="text-center py-8">
      <p class="text-gray-600">Aucune promotion trouvée.</p>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="promotion in filteredPromotions"
        :key="promotion.promotionId"
        class="bg-white rounded-lg shadow-md border overflow-hidden"
      >
        <!-- En-tête de la carte -->
        <div class="p-4 border-b bg-gray-50">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-bold text-lg text-gray-800">{{ promotion.code }}</h4>
              <p class="text-sm text-gray-600">{{ promotion.description }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span
                :class="getStatusClass(promotion)"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ getStatusText(promotion) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Contenu de la carte -->
        <div class="p-4 space-y-3">
          <!-- Réduction -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Réduction :</span>
            <div class="text-right">
              <div class="font-semibold text-green-600">
                {{ promotion.discountType === 'percentage' 
                    ? `${promotion.discountValue}%` 
                    : `${promotion.discountValue}€` }}
              </div>
              <div v-if="promotion.maxDiscountAmount" class="text-xs text-gray-500">
                Plafond : {{ promotion.maxDiscountAmount }}€
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Début :</span>
              <span>{{ formatDate(promotion.startDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Fin :</span>
              <span>{{ formatDate(promotion.endDate) }}</span>
            </div>
          </div>

          <!-- Utilisation -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Utilisations :</span>
            <span class="text-sm">
              {{ promotion.usageCount }}{{ promotion.usageLimit ? `/${promotion.usageLimit}` : '' }}
            </span>
          </div>

          <!-- Application -->
          <div class="text-sm">
            <span class="text-gray-600">Application : </span>
            <span class="font-medium">
              {{ getApplicationText(promotion) }}
            </span>
          </div>

          <!-- Montant minimum -->
          <div v-if="promotion.minOrderAmount > 0" class="text-sm">
            <span class="text-gray-600">Montant min : </span>
            <span class="font-medium">{{ promotion.minOrderAmount }}€</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-4 border-t bg-gray-50 flex justify-between">
          <router-link
            :to="`/edit-promotion/${promotion.promotionId}`"
            class="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Modifier
          </router-link>
          <button
            @click="deletePromotionHandler(promotion.promotionId)"
            class="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" :class="messageClass" class="fixed bottom-4 right-4 p-4 rounded-md shadow-lg">
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { fetchPromotions, deletePromotion } from '../services/promotionService';
import { Promotion } from '../types/Promotion';

export default defineComponent({
  name: 'PromotionList',
  setup() {
    const promotions = ref<Promotion[]>([]);
    const isLoading = ref(true);
    const filterType = ref<'all' | 'active' | 'expired'>('all');
    const message = ref('');
    const messageType = ref<'success' | 'error'>('success');

    const messageClass = computed(() => ({
      'bg-green-100 text-green-800 border border-green-200': messageType.value === 'success',
      'bg-red-100 text-red-800 border border-red-200': messageType.value === 'error'
    }));

    const activePromotions = computed(() => {
      const now = new Date();
      return promotions.value.filter(p => 
        p.isActive && 
        new Date(p.startDate) <= now && 
        new Date(p.endDate) >= now
      );
    });

    const expiredPromotions = computed(() => {
      const now = new Date();
      return promotions.value.filter(p => new Date(p.endDate) < now);
    });

    const filteredPromotions = computed(() => {
      switch (filterType.value) {
        case 'active':
          return activePromotions.value;
        case 'expired':
          return expiredPromotions.value;
        default:
          return promotions.value;
      }
    });

    const loadPromotions = async () => {
      try {
        isLoading.value = true;
        promotions.value = await fetchPromotions();
      } catch (error: any) {
        showMessage(error.message || 'Erreur lors du chargement des promotions', 'error');
      } finally {
        isLoading.value = false;
      }
    };

    const deletePromotionHandler = async (id: number) => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
        return;
      }

      try {
        await deletePromotion(id);
        await loadPromotions();
        showMessage('Promotion supprimée avec succès', 'success');
      } catch (error: any) {
        showMessage(error.message || 'Erreur lors de la suppression', 'error');
      }
    };

    const showMessage = (msg: string, type: 'success' | 'error') => {
      message.value = msg;
      messageType.value = type;
      setTimeout(() => {
        message.value = '';
      }, 5000);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getStatusClass = (promotion: Promotion) => {
      const now = new Date();
      const start = new Date(promotion.startDate);
      const end = new Date(promotion.endDate);

      if (!promotion.isActive) {
        return 'bg-gray-100 text-gray-800';
      } else if (end < now) {
        return 'bg-red-100 text-red-800';
      } else if (start <= now && end >= now) {
        return 'bg-green-100 text-green-800';
      } else {
        return 'bg-yellow-100 text-yellow-800';
      }
    };

    const getStatusText = (promotion: Promotion) => {
      const now = new Date();
      const start = new Date(promotion.startDate);
      const end = new Date(promotion.endDate);

      if (!promotion.isActive) {
        return 'Inactive';
      } else if (end < now) {
        return 'Expirée';
      } else if (start <= now && end >= now) {
        return 'Active';
      } else {
        return 'Programmée';
      }
    };

    const getApplicationText = (promotion: Promotion) => {
      switch (promotion.applicationType) {
        case 'all':
          return 'Tous les produits';
        case 'category':
          return `Catégories : ${promotion.applicableCategories?.join(', ') || 'Non spécifiées'}`;
        case 'product':
          return `${promotion.applicableProductIds?.length || 0} produit(s) spécifique(s)`;
        default:
          return 'Non définie';
      }
    };

    onMounted(loadPromotions);

    return {
      promotions,
      isLoading,
      filterType,
      message,
      messageClass,
      activePromotions,
      expiredPromotions,
      filteredPromotions,
      deletePromotionHandler,
      formatDate,
      getStatusClass,
      getStatusText,
      getApplicationText
    };
  }
});
</script> 