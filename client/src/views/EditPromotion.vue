<template>
  <main class="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
    <div class="w-full space-y-6 text-gray-600 sm:max-w-2xl">
      <div class="text-center">
        <div class="mt-5 space-y-2">
          <h3 class="text-gray-800 text-2xl font-bold sm:text-3xl">
            Modifier la promotion
          </h3>
          <p class="text-gray-600">Modifiez les détails de votre promotion</p>
        </div>
      </div>
      
      <div class="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Chargement de la promotion...</p>
        </div>

        <form v-else-if="promotion" @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Code promo -->
          <div>
            <label for="code" class="font-medium">Code promo *</label>
            <input
              type="text"
              v-model="code"
              @input="handleChange('code', $event.target.value.toUpperCase())"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              placeholder="Ex: WELCOME20"
            />
            <span v-if="codeError" class="text-red-500 text-sm">{{ codeError }}</span>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="font-medium">Description *</label>
            <textarea
              v-model="description"
              @input="handleChange('description', $event.target.value)"
              required
              rows="3"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              placeholder="Description de la promotion"
            ></textarea>
            <span v-if="descriptionError" class="text-red-500 text-sm">{{ descriptionError }}</span>
          </div>

          <!-- Type et valeur de réduction -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="discountType" class="font-medium">Type de réduction *</label>
              <select
                v-model="discountType"
                @change="handleChange('discountType', $event.target.value)"
                required
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </div>
            
            <div>
              <label for="discountValue" class="font-medium">
                Valeur {{ discountType === 'percentage' ? '(%)' : '(€)' }} *
              </label>
              <input
                type="number"
                v-model="discountValue"
                @input="handleChange('discountValue', parseFloat($event.target.value))"
                :min="discountType === 'percentage' ? 1 : 0.01"
                :max="discountType === 'percentage' ? 100 : undefined"
                step="0.01"
                required
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
              <span v-if="discountValueError" class="text-red-500 text-sm">{{ discountValueError }}</span>
            </div>
          </div>

          <!-- Conditions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="minOrderAmount" class="font-medium">Montant minimum (€)</label>
              <input
                type="number"
                v-model="minOrderAmount"
                @input="handleChange('minOrderAmount', parseFloat($event.target.value) || 0)"
                min="0"
                step="0.01"
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                placeholder="0"
              />
            </div>
            
            <div>
              <label for="maxDiscountAmount" class="font-medium">Réduction maximum (€)</label>
              <input
                type="number"
                v-model="maxDiscountAmount"
                @input="handleChange('maxDiscountAmount', $event.target.value ? parseFloat($event.target.value) : null)"
                min="0"
                step="0.01"
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                placeholder="Aucune limite"
              />
              <p class="text-xs text-gray-500 mt-1">Laissez vide pour aucune limite</p>
            </div>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="startDate" class="font-medium">Date de début *</label>
              <input
                type="datetime-local"
                v-model="startDate"
                @input="handleChange('startDate', $event.target.value)"
                required
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
            </div>
            
            <div>
              <label for="endDate" class="font-medium">Date de fin *</label>
              <input
                type="datetime-local"
                v-model="endDate"
                @input="handleChange('endDate', $event.target.value)"
                required
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
              <span v-if="endDateError" class="text-red-500 text-sm">{{ endDateError }}</span>
            </div>
          </div>

          <!-- Limite d'usage -->
          <div>
            <label for="usageLimit" class="font-medium">Limite d'utilisation</label>
            <input
              type="number"
              v-model="usageLimit"
              @input="handleChange('usageLimit', $event.target.value ? parseInt($event.target.value) : null)"
              min="1"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              placeholder="Illimitée"
            />
            <p class="text-xs text-gray-500 mt-1">
              Utilisations actuelles: {{ promotion.usageCount || 0 }}
              {{ usageLimit ? `/ ${usageLimit}` : '' }}
            </p>
          </div>

          <!-- Application -->
          <div>
            <label for="applicationType" class="font-medium">Application *</label>
            <select
              v-model="applicationType"
              @change="handleChange('applicationType', $event.target.value)"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            >
              <option value="all">Tous les produits</option>
              <option value="category">Catégories spécifiques</option>
              <option value="product">Produits spécifiques</option>
            </select>
          </div>

          <!-- Catégories (si applicable) -->
          <div v-if="applicationType === 'category'">
            <label for="applicableCategories" class="font-medium">Catégories applicables</label>
            <input
              type="text"
              v-model="applicableCategoriesText"
              @input="handleCategoriesChange"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              placeholder="Ex: Electronics, Clothing, Books (séparées par des virgules)"
            />
          </div>

          <!-- Statut -->
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="isActive"
              @change="handleChange('isActive', $event.target.checked)"
              id="isActive"
              class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <label for="isActive" class="font-medium">Promotion active</label>
          </div>

          <!-- Boutons -->
          <div class="flex space-x-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150 disabled:opacity-50"
            >
              {{ isSubmitting ? 'Mise à jour...' : 'Mettre à jour' }}
            </button>
            
            <router-link
              to="/promotions"
              class="flex-1 px-4 py-2 text-center text-gray-700 font-medium bg-gray-200 hover:bg-gray-300 rounded-lg duration-150"
            >
              Annuler
            </router-link>
          </div>
        </form>

        <div v-else class="text-center py-8">
          <p class="text-red-600">Promotion non trouvée</p>
          <router-link to="/promotions" class="text-indigo-600 hover:underline">
            Retour aux promotions
          </router-link>
        </div>

        <p v-if="serverError" class="error mt-4 text-red-500">{{ serverError }}</p>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { z } from 'zod';
import { useForm } from '../composables/useForm';
import { fetchPromotionById, updatePromotion } from '../services/promotionService';

const promotionSchema = z.object({
  code: z.string().min(1, 'Code est requis').max(20, 'Code trop long'),
  description: z.string().min(1, 'Description est requise'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0.01, 'Valeur doit être positive'),
  minOrderAmount: z.number().min(0, 'Montant minimum invalide'),
  maxDiscountAmount: z.number().nullable(),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  usageLimit: z.number().nullable(),
  applicationType: z.enum(['all', 'category', 'product']),
  applicableCategories: z.array(z.string()).optional(),
  isActive: z.boolean(),
}).refine((data) => {
  return new Date(data.startDate) < new Date(data.endDate);
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"],
});

export default defineComponent({
  name: 'EditPromotion',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const loading = ref(true);
    const promotion = ref<any>(null);
    const applicableCategoriesText = ref('');

    const {
      values,
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      applicationType,
      isActive,
      codeError,
      descriptionError,
      discountValueError,
      endDateError,
      isSubmitting,
      serverError,
      handleChange,
      handleSubmit,
    } = useForm({
      initialValues: {
        code: '',
        description: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: null as number | null,
        startDate: '',
        endDate: '',
        usageLimit: null as number | null,
        applicationType: 'all' as 'all' | 'category' | 'product',
        applicableCategories: [] as string[],
        isActive: true,
      },
      schema: promotionSchema,
      onSubmit: async (promotionData) => {
        try {
          const promotionId = parseInt(route.params.id as string);
          await updatePromotion(promotionId, promotionData);
          router.push('/promotions');
        } catch (error) {
          console.error('Erreur lors de la mise à jour:', error);
        }
      },
    });

    const handleCategoriesChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      applicableCategoriesText.value = target.value;
      const categories = target.value
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0);
      handleChange('applicableCategories', categories);
    };

    const loadPromotion = async () => {
      try {
        loading.value = true;
        const promotionId = parseInt(route.params.id as string);
        const data = await fetchPromotionById(promotionId);
        promotion.value = data;

        // Remplir le formulaire
        handleChange('code', data.code);
        handleChange('description', data.description);
        handleChange('discountType', data.discountType);
        handleChange('discountValue', data.discountValue);
        handleChange('minOrderAmount', data.minOrderAmount || 0);
        handleChange('maxDiscountAmount', data.maxDiscountAmount);
        handleChange('startDate', new Date(data.startDate).toISOString().slice(0, 16));
        handleChange('endDate', new Date(data.endDate).toISOString().slice(0, 16));
        handleChange('usageLimit', data.usageLimit);
        handleChange('applicationType', data.applicationType);
        handleChange('isActive', data.isActive);

        if (data.applicableCategories && data.applicableCategories.length > 0) {
          applicableCategoriesText.value = data.applicableCategories.join(', ');
          handleChange('applicableCategories', data.applicableCategories);
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadPromotion);

    return {
      loading,
      promotion,
      applicableCategoriesText,
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      applicationType,
      isActive,
      codeError,
      descriptionError,
      discountValueError,
      endDateError,
      isSubmitting,
      serverError,
      handleChange,
      handleSubmit,
      handleCategoriesChange,
    };
  },
});
</script>

<style scoped>
.error {
  color: red;
}
</style> 