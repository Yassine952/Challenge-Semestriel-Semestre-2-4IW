<template>
  <main class="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
    <div class="w-full space-y-6 text-gray-600 sm:max-w-2xl">
      <div class="text-center">
        <div class="mt-5 space-y-2">
          <h3 class="text-gray-800 text-2xl font-bold sm:text-3xl">
            🎫 Créer une Promotion
          </h3>
          <p class="text-gray-600">
            Configurez votre code promo avec toutes les options nécessaires
          </p>
        </div>
      </div>
      
      <div class="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Informations de base -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="code" class="font-medium">Code Promo *</label>
              <input
                type="text"
                v-model="code"
                @input="handleChange('code', $event.target.value.toUpperCase())"
                placeholder="ex: NOEL2024"
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                required
              />
              <p class="text-xs text-gray-500 mt-1">3-20 caractères, lettres majuscules et chiffres uniquement</p>
              <span v-if="codeError" class="text-red-500 text-sm">{{ codeError }}</span>
            </div>
            
            <div>
              <label for="description" class="font-medium">Description *</label>
              <input
                type="text"
                v-model="description"
                @input="handleChange('description', $event.target.value)"
                placeholder="ex: Promotion de Noël 2024"
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                required
              />
              <span v-if="descriptionError" class="text-red-500 text-sm">{{ descriptionError }}</span>
            </div>
          </div>

          <!-- Type et valeur de réduction -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="discountType" class="font-medium">Type de réduction *</label>
              <select
                v-model="discountType"
                @change="handleChange('discountType', $event.target.value)"
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                required
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
              <span v-if="discountTypeError" class="text-red-500 text-sm">{{ discountTypeError }}</span>
            </div>
            
            <div>
              <label for="discountValue" class="font-medium">
                Valeur de réduction * {{ discountType === 'percentage' ? '(%)' : '(€)' }}
              </label>
              <input
                type="number"
                v-model.number="discountValue"
                @input="handleChange('discountValue', parseFloat($event.target.value))"
                :max="discountType === 'percentage' ? 100 : undefined"
                min="0"
                step="0.01"
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                required
              />
              <span v-if="discountValueError" class="text-red-500 text-sm">{{ discountValueError }}</span>
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
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                required
              />
              <span v-if="startDateError" class="text-red-500 text-sm">{{ startDateError }}</span>
            </div>
            
            <div>
              <label for="endDate" class="font-medium">Date de fin *</label>
              <input
                type="datetime-local"
                v-model="endDate"
                @input="handleChange('endDate', $event.target.value)"
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                required
              />
              <span v-if="endDateError" class="text-red-500 text-sm">{{ endDateError }}</span>
            </div>
          </div>

          <!-- Conditions -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="minOrderAmount" class="font-medium">Montant minimum (€)</label>
              <input
                type="number"
                v-model.number="minOrderAmount"
                @input="handleChange('minOrderAmount', parseFloat($event.target.value) || 0)"
                min="0"
                step="0.01"
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
              <p class="text-xs text-gray-500 mt-1">0 = pas de minimum</p>
            </div>
            
            <div>
              <label for="maxDiscountAmount" class="font-medium">Réduction max (€)</label>
              <input
                type="number"
                v-model.number="maxDiscountAmount"
                @input="handleChange('maxDiscountAmount', parseFloat($event.target.value) || undefined)"
                min="0"
                step="0.01"
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
              <p class="text-xs text-gray-500 mt-1">Vide = pas de limite</p>
            </div>
            
            <div>
              <label for="usageLimit" class="font-medium">Limite d'utilisation</label>
              <input
                type="number"
                v-model.number="usageLimit"
                @input="handleChange('usageLimit', parseInt($event.target.value) || undefined)"
                min="1"
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
              <p class="text-xs text-gray-500 mt-1">Vide = illimité</p>
            </div>
          </div>

          <!-- Application -->
          <div>
            <label class="font-medium">Application de la promotion *</label>
            <div class="mt-2 space-y-3">
              <div class="flex items-center">
                <input
                  type="radio"
                  id="all"
                  value="all"
                  v-model="applicationType"
                  @change="handleChange('applicationType', $event.target.value)"
                  class="mr-2"
                />
                <label for="all" class="text-sm">Tous les produits</label>
              </div>
              
              <div class="flex items-center">
                <input
                  type="radio"
                  id="category"
                  value="category"
                  v-model="applicationType"
                  @change="handleChange('applicationType', $event.target.value)"
                  class="mr-2"
                />
                <label for="category" class="text-sm">Catégories spécifiques</label>
              </div>
              
              <div class="flex items-center">
                <input
                  type="radio"
                  id="product"
                  value="product"
                  v-model="applicationType"
                  @change="handleChange('applicationType', $event.target.value)"
                  class="mr-2"
                />
                <label for="product" class="text-sm">Produits spécifiques</label>
              </div>
            </div>
          </div>

          <!-- Sélection des catégories -->
          <div v-if="applicationType === 'category'" class="space-y-2">
            <label class="font-medium">Catégories concernées *</label>
            <div v-if="categories.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              <div v-for="category in categories" :key="category" class="flex items-center">
                <input
                  type="checkbox"
                  :id="`cat-${category}`"
                  v-model="applicableCategories"
                  :value="category"
                  class="mr-2"
                />
                <label :for="`cat-${category}`" class="text-sm">{{ category }}</label>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">Chargement des catégories...</p>
          </div>

          <!-- Sélection des produits -->
          <div v-if="applicationType === 'product'" class="space-y-2">
            <label class="font-medium">Produits concernés *</label>
            <div v-if="products.length > 0" class="max-h-40 overflow-y-auto border rounded-md p-3">
              <div v-for="product in products" :key="product.productId" class="flex items-center mb-2">
                <input
                  type="checkbox"
                  :id="`prod-${product.productId}`"
                  v-model="applicableProductIds"
                  :value="product.productId"
                  class="mr-2"
                />
                <label :for="`prod-${product.productId}`" class="text-sm">
                  {{ product.name }} - {{ product.price }}€
                </label>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">Chargement des produits...</p>
          </div>

          <!-- Statut -->
          <div class="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              v-model="isActive"
              @change="handleChange('isActive', $event.target.checked)"
              class="mr-2"
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
              {{ isSubmitting ? 'Création...' : 'Créer la Promotion' }}
            </button>
            
            <router-link
              to="/promotions"
              class="px-4 py-2 text-gray-600 font-medium bg-gray-200 hover:bg-gray-300 rounded-lg duration-150 text-center"
            >
              Annuler
            </router-link>
          </div>
        </form>
        
        <p v-if="serverError" class="error mt-4 text-red-500">{{ serverError }}</p>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { useForm } from '../composables/useForm';
import { createPromotion } from '../services/promotionService';
import { fetchCategories, fetchProducts } from '../services/productService';
import { Product } from '../types/Product';

const promotionSchema = z.object({
  code: z.string().min(3, 'Code trop court').max(20, 'Code trop long').regex(/^[A-Z0-9]+$/, 'Lettres majuscules et chiffres uniquement'),
  description: z.string().min(1, 'Description requise'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0, 'Valeur positive requise'),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  applicationType: z.enum(['all', 'category', 'product']),
  applicableCategories: z.array(z.string()).optional(),
  applicableProductIds: z.array(z.number()).optional(),
  isActive: z.boolean().default(true),
}).refine((data) => {
  return new Date(data.startDate) < new Date(data.endDate);
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"],
}).refine((data) => {
  if (data.discountType === 'percentage') {
    return data.discountValue <= 100;
  }
  return true;
}, {
  message: "Le pourcentage ne peut pas dépasser 100%",
  path: ["discountValue"],
});

export default defineComponent({
  name: 'AddPromotion',
  setup() {
    const router = useRouter();
    const categories = ref<string[]>([]);
    const products = ref<Product[]>([]);

    const {
      values,
      code,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      applicationType,
      applicableCategories,
      applicableProductIds,
      isActive,
      codeError,
      descriptionError,
      discountTypeError,
      discountValueError,
      startDateError,
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
        startDate: '',
        endDate: '',
        minOrderAmount: 0,
        maxDiscountAmount: undefined as number | undefined,
        usageLimit: undefined as number | undefined,
        applicationType: 'all' as 'all' | 'category' | 'product',
        applicableCategories: [] as string[],
        applicableProductIds: [] as number[],
        isActive: true,
      },
      schema: promotionSchema,
      onSubmit: async (promotionData) => {
        try {
          await createPromotion(promotionData);
          router.push('/promotions');
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Erreur lors de la création de la promotion');
        }
      },
    });

    const loadData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);
        categories.value = categoriesData;
        products.value = productsData;
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    onMounted(loadData);

    return {
      categories,
      products,
      code,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      applicationType,
      applicableCategories,
      applicableProductIds,
      isActive,
      codeError,
      descriptionError,
      discountTypeError,
      discountValueError,
      startDateError,
      endDateError,
      isSubmitting,
      serverError,
      handleChange,
      handleSubmit,
    };
  },
});
</script> 