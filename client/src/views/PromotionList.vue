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
            @click="deletePromotion(promotion.promotionId)"
            class="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation pour suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
          <p class="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer cette promotion ?
            <br><span class="text-red-600 font-medium">Cette action est irréversible.</span>
          </p>
          <div class="flex justify-center space-x-4">
            <button 
              @click="showDeleteModal = false"
              class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              @click="confirmDeletePromotion"
              :disabled="isDeleting"
              class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <svg v-if="isDeleting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isDeleting ? 'Suppression...' : 'Supprimer' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { fetchPromotions, deletePromotion as deletePromotionService } from '../services/promotionService';
import { Promotion } from '../types/Promotion';
import { useNotifications } from '../composables/useNotifications';

export default defineComponent({
  name: 'PromotionList',
  setup() {
    const { showSuccess, showError } = useNotifications();
    const promotions = ref<Promotion[]>([]);
    const isLoading = ref(true);
    const filterType = ref<'all' | 'active' | 'expired'>('all');
    const showDeleteModal = ref(false);
    const isDeleting = ref(false);
    const promotionToDelete = ref<number | null>(null);

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
        showError('Erreur de chargement', error.message || 'Erreur lors du chargement des promotions');
      } finally {
        isLoading.value = false;
      }
    };

    const deletePromotion = (id: number) => {
      promotionToDelete.value = id;
      showDeleteModal.value = true;
    };

    const confirmDeletePromotion = async () => {
      if (!promotionToDelete.value) return;
      
      isDeleting.value = true;
      try {
        await deletePromotionService(promotionToDelete.value);
        await loadPromotions();
        showSuccess('Suppression réussie', 'La promotion a été supprimée avec succès');
      } catch (error: any) {
        showError('Erreur de suppression', error.message || 'Erreur lors de la suppression de la promotion');
      } finally {
        showDeleteModal.value = false;
        promotionToDelete.value = null;
        isDeleting.value = false;
      }
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
      activePromotions,
      expiredPromotions,
      filteredPromotions,
      showDeleteModal,
      isDeleting,
      deletePromotion,
      confirmDeletePromotion,
      formatDate,
      getStatusClass,
      getStatusText,
      getApplicationText
    };
  }
});
</script> 