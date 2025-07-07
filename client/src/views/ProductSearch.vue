<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header avec titre -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            🔍 Recherche de Produits
          </h1>
          <p class="mt-2 text-lg text-gray-600">
            Trouvez exactement ce que vous cherchez parmi notre catalogue
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- Sidebar avec filtres -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Filtres
              </h2>
              <button 
                @click="clearAllFilters"
                class="text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
              >
                Effacer tout
              </button>
            </div>

            <form @submit.prevent="handleManualSubmit" class="space-y-6">
              <!-- Recherche globale -->
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700">
                  🔍 Recherche globale
                </label>
                <div class="relative">
                  <input
                    type="text"
                    v-model="globalSearch"
                    @input="handleGlobalSearchChange($event.target.value)"
                    placeholder="Rechercher un produit..."
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <p class="text-xs text-gray-500">Recherche dans les noms et descriptions</p>
              </div>

              <!-- Filtres avancés -->
              <div class="border-t pt-6">
                <button 
                  type="button"
                  @click="showAdvancedFilters = !showAdvancedFilters"
                  class="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <span>⚙️ Filtres avancés</span>
                  <svg :class="showAdvancedFilters ? 'rotate-180' : ''" class="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <div v-show="showAdvancedFilters" class="mt-4 space-y-4">
                  <!-- Nom spécifique -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      📝 Nom spécifique
                    </label>
                    <input
                      type="text"
                      v-model="name"
                      @input="handleChange('name', $event.target.value)"
                      placeholder="Nom exact du produit..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <span v-if="nameError" class="text-red-500 text-xs mt-1">{{ nameError }}</span>
                  </div>

                  <!-- Description spécifique -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      📄 Description spécifique
                    </label>
                    <input
                      type="text"
                      v-model="description"
                      @input="handleChange('description', $event.target.value)"
                      placeholder="Mots-clés dans la description..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <span v-if="descriptionError" class="text-red-500 text-xs mt-1">{{ descriptionError }}</span>
                  </div>

                  <!-- Catégorie -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      🏷️ Catégorie
                    </label>
                    <select
                      v-model="category"
                      @change="handleChange('category', $event.target.value)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="">Toutes les catégories</option>
                      <option v-for="category in categories" :key="category" :value="category">
                        {{ category }}
                      </option>
                    </select>
                    <span v-if="categoryError" class="text-red-500 text-xs mt-1">{{ categoryError }}</span>
                  </div>

                  <!-- Prix -->
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        💰 Prix min (€)
                      </label>
                      <input
                        type="number"
                        :value="priceMin || ''"
                        @input="handlePriceChange('priceMin', $event.target.value)"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      <span v-if="priceMinError" class="text-red-500 text-xs mt-1">{{ priceMinError }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        💰 Prix max (€)
                      </label>
                      <input
                        type="number"
                        :value="priceMax || ''"
                        @input="handlePriceChange('priceMax', $event.target.value)"
                        step="0.01"
                        min="0"
                        placeholder="999.99"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      <span v-if="priceMaxError" class="text-red-500 text-xs mt-1">{{ priceMaxError }}</span>
                    </div>
                  </div>

                  <!-- Options -->
                  <div class="space-y-3">
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="inStock"
                        id="inStock"
                        @input="handleChange('inStock', $event.target.checked)"
                        class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label for="inStock" class="ml-3 text-sm font-medium text-gray-700">
                        📦 En stock uniquement
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="onPromotion"
                        id="onPromotion"
                        @input="handleChange('onPromotion', $event.target.checked)"
                        class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label for="onPromotion" class="ml-3 text-sm font-medium text-gray-700">
                        🎫 En promotion uniquement
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bouton de recherche -->
              <button
                type="button"
                @click="handleManualSubmit"
                :disabled="isSubmitting"
                class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                {{ isSubmitting ? 'Recherche...' : 'Rechercher' }}
              </button>

              <p v-if="serverError" class="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                {{ serverError }}
              </p>
            </form>
          </div>
        </div>

        <!-- Zone des résultats -->
        <div class="lg:col-span-3">
          <!-- Barre de statut -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div class="flex items-center">
              <span class="text-gray-600">
                {{ products.length }} produit{{ products.length > 1 ? 's' : '' }} trouvé{{ products.length > 1 ? 's' : '' }}
              </span>
              <div v-if="hasActiveFilters" class="ml-4 flex items-center text-indigo-600">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                <span class="text-sm font-medium">Filtres actifs</span>
              </div>
            </div>
          </div>

          <!-- Résultats -->
          <div v-if="products.length === 0 && hasSearched" class="text-center py-16">
            <div class="max-w-md mx-auto">
              <svg class="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12c0-3.314-2.686-6-6-6s-6 2.686-6 6c0 2.137.833 4.146 2.291 5.291z"></path>
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun produit trouvé</h3>
              <p class="mt-2 text-gray-500">Essayez de modifier vos critères de recherche ou d'effacer les filtres.</p>
              <button 
                @click="clearAllFilters"
                class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
              >
                Effacer tous les filtres
              </button>
            </div>
          </div>

          <!-- Grille de produits -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div 
              v-for="product in products" 
              :key="product.productId" 
              class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
            >
              <!-- Badge promotion -->
              <div v-if="shouldShowPromoBadge" class="absolute top-4 right-4 z-10">
                <span class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  🎫 PROMO
                </span>
              </div>

              <!-- Image du produit -->
              <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                <img 
                  v-if="product.imageUrl" 
                  :src="getImageUrl(product.imageUrl)" 
                  :alt="product.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                  @load="handleImageLoad"
                />
                <svg v-else class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <!-- Debug info -->
                <div v-if="false" class="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  Image: {{ product.imageUrl || 'AUCUNE' }}
                </div>
              </div>

              <!-- Contenu -->
              <div class="p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {{ product.name }}
                </h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                  {{ product.description }}
                </p>

                <!-- Prix et promotions -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl font-bold text-gray-900">
                      {{ (product.price / 100).toFixed(2) }} €
                    </span>
                    <div class="text-right">
                      <div class="text-sm text-gray-500">Stock</div>
                      <div class="font-semibold" :class="product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'">
                        {{ product.stock }} unités
                      </div>
                    </div>
                  </div>
                  
                  <!-- Affichage de toutes les promotions -->
                  <div v-if="shouldShowPromoText" class="flex flex-wrap gap-2">
                    <span 
                      v-for="(promoText, index) in getPromotionTextsForProduct(product)" 
                      :key="index"
                      class="text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full border border-green-200 inline-flex items-center"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                      {{ promoText }}
                    </span>
                  </div>
                </div>

                <!-- Bouton d'ajout au panier -->
                <button 
                  @click="addToCart(product)"
                  :disabled="product.stock === 0"
                  class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 7.2M7 13l-1.8 7.2m0 0h12.6m-12.6 0L5.4 5M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8"></path>
                  </svg>
                  <span>{{ product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';
import { searchProducts, fetchCategories } from '../services/productService';
import { addToCart as addProductToCart } from '../services/cartService';
import { fetchActivePromotionsForProduct, fetchPromotions } from '../services/promotionService';
import { useForm } from '../composables/useForm';
import { Product } from '../types/Product';
import { useNotifications } from '../composables/useNotifications';

const searchSchema = z.object({
  globalSearch: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  priceMin: z.number().min(0, 'Prix minimum doit être positif').optional(),
  priceMax: z.number().min(0, 'Prix maximum doit être positif').optional(),
  inStock: z.boolean().optional(),
  onPromotion: z.boolean().optional(),
});

export default defineComponent({
  name: 'ProductSearch',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const products = ref<Product[]>([]);
    const categories = ref<string[]>([]);
    const showAdvancedFilters = ref(false);
    const hasSearched = ref(false); // Pour savoir si une recherche a été effectuée
    const isManualSearch = ref(false); // Pour distinguer recherche manuelle vs automatique
    const activePromotions = ref<any[]>([]); // Promotions actives
    const { showSuccess, showError } = useNotifications();

    // Fonction utilitaire pour convertir les prix de manière sécurisée
    const safeParsePrice = (value: any): number => {
      if (!value) return 0;
      const parsed = parseFloat(value.toString());
      return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
    };

    // Fonction pour convertir les centimes en euros (pour l'affichage)
    const centsToEuros = (cents: any): number => {
      if (!cents) return 0;
      const parsed = parseFloat(cents.toString());
      return isNaN(parsed) || !isFinite(parsed) ? 0 : Math.round(parsed) / 100;
    };

    // Fonction pour convertir les euros en centimes (pour l'API)
    const eurosToCents = (euros: any): number => {
      if (!euros) return 0;
      const parsed = parseFloat(euros.toString());
      if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0) return 0;
      return Math.round(parsed * 100);
    };

    // Fonction spéciale pour gérer les changements de prix
    const handlePriceChange = (field: 'priceMin' | 'priceMax', value: string) => {
      // Si le champ est vide, mettre 0
      if (!value || value === '') {
        handleChange(field, 0);
        return;
      }
      
      // Convertir en nombre de manière sécurisée
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        // Ne pas mettre à jour si la valeur est invalide
        return;
      }
      
      // Mettre à jour avec la valeur valide
      handleChange(field, numValue);
    };

    // Timer pour le debounce de la recherche globale
    let searchTimeout: NodeJS.Timeout | null = null;

    // Fonction pour gérer la recherche globale avec délai
    const handleGlobalSearchChange = (value: string) => {
      handleChange('globalSearch', value);
      hasSearched.value = false; // Réinitialiser le statut de recherche
      isManualSearch.value = false; // Réinitialiser le statut de recherche manuelle
      
      // Annuler le timer précédent
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Déclencher la recherche après 500ms d'inactivité
      searchTimeout = setTimeout(() => {
        if (value.trim() || Object.keys(route.query).length > 0) {
          handleSubmit();
        }
      }, 500);
    };

    const {
      values,
      globalSearch,
      name,
      description,
      category,
      priceMin,
      priceMax,
      inStock,
      onPromotion,
      nameError,
      descriptionError,
      categoryError,
      priceMinError,
      priceMaxError,
      inStockError,
      isSubmitting,
      serverError,
      handleChange,
      handleSubmit,
    } = useForm({
      initialValues: {
        globalSearch: route.query.q || route.query.search || '',
        name: route.query.name || '',
        description: route.query.description || '',
        category: route.query.category || '',
        priceMin: route.query.priceMin ? parseFloat(route.query.priceMin as string) : 0,
        priceMax: route.query.priceMax ? parseFloat(route.query.priceMax as string) : 0,
        inStock: route.query.inStock === 'true',
        onPromotion: route.query.onPromotion === 'true',
      },
      schema: searchSchema,
      onSubmit: async (searchCriteria) => {
        const query: any = {};

        // Recherche globale (prioritaire)
        if (searchCriteria.globalSearch) {
          query.q = searchCriteria.globalSearch;
        }

        // Recherches spécifiques
        if (searchCriteria.name) query.name = searchCriteria.name;
        if (searchCriteria.description) query.description = searchCriteria.description;
        if (searchCriteria.category) query.category = searchCriteria.category;
        // Garder les prix en euros dans l'URL (plus intuitif pour l'utilisateur)
        if (searchCriteria.priceMin && searchCriteria.priceMin > 0) {
          query.priceMin = searchCriteria.priceMin;
        }
        if (searchCriteria.priceMax && searchCriteria.priceMax > 0) {
          query.priceMax = searchCriteria.priceMax;
        }
        if (searchCriteria.inStock) query.inStock = 'true';
        if (searchCriteria.onPromotion) query.onPromotion = 'true';

        // Mettre à jour l'URL pour permettre le partage
        router.push({ name: 'ProductSearch', query });

        try {
          const response = await searchProducts(query);
          products.value = response;
          hasSearched.value = true; // Marquer qu'une recherche a été effectuée
          // Note: isManualSearch reste tel qu'il était défini avant l'appel
        } catch (error) {
          console.error('Erreur lors de la recherche:', error);
        }
      },
    });

    const loadCategories = async () => {
      try {
        categories.value = await fetchCategories();
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const loadActivePromotions = async () => {
      try {
        // Charger TOUTES les promotions actives (pas seulement les globales)
        console.log('🎫 Chargement de toutes les promotions actives...');
        activePromotions.value = await fetchPromotions({ active: true });
        console.log('🎫 Promotions actives chargées:', activePromotions.value);
        console.log('🎫 Nombre de promotions:', activePromotions.value.length);
        
        // Debug : afficher les types de promotions
        activePromotions.value.forEach(promo => {
          console.log(`🎫 Promotion ${promo.code}:`, {
            type: promo.applicationType,
            categories: promo.applicableCategories,
            products: promo.applicableProductIds
          });
        });
      } catch (error) {
        console.error('Error fetching active promotions:', error);
        // En cas d'erreur, laisser le tableau vide - pas de promotion factice
        activePromotions.value = [];
      }
    };

    // Fonction pour obtenir les promotions applicables à un produit spécifique
    const getPromotionsForProduct = async (product: Product) => {
      try {
        const promotions = await fetchActivePromotionsForProduct(product.productId, product.category);
        return promotions;
      } catch (error) {
        console.error('Error fetching promotions for product:', product.productId, error);
        return [];
      }
    };

    // Fonction pour obtenir les textes de promotions pour un produit spécifique
    const getPromotionTextsForProduct = (product: Product) => {
      if (activePromotions.value.length === 0) {
        console.log(`🎫 Aucune promotion active pour ${product.name}`);
        return [];
      }
      
      console.log(`🎯 Analyse promotions pour "${product.name}" (ID: ${product.productId}, Catégorie: "${product.category}"):`);
      
      // Filtrer les promotions applicables à ce produit
      const applicablePromotions = activePromotions.value.filter(promo => {
        console.log(`   🔍 Test promotion ${promo.code} (${promo.applicationType}):`);
        
        if (promo.applicationType === 'all') {
          console.log(`      ✅ Applicable (tous produits)`);
          return true; // Applicable à tous les produits
        } else if (promo.applicationType === 'category') {
          const isApplicable = promo.applicableCategories && promo.applicableCategories.includes(product.category);
          console.log(`      ${isApplicable ? '✅' : '❌'} Catégorie "${product.category}" ${isApplicable ? 'trouvée' : 'non trouvée'} dans [${promo.applicableCategories}]`);
          return isApplicable;
        } else if (promo.applicationType === 'product') {
          const isApplicable = promo.applicableProductIds && promo.applicableProductIds.includes(product.productId);
          console.log(`      ${isApplicable ? '✅' : '❌'} Produit ID ${product.productId} ${isApplicable ? 'trouvé' : 'non trouvé'} dans [${promo.applicableProductIds}]`);
          return isApplicable;
        }
        console.log(`      ❌ Type d'application non reconnu`);
        return false;
      });
      
      console.log(`   🎫 Promotions applicables trouvées: ${applicablePromotions.length}`);
      
      // Convertir en textes de promotion
      const texts = applicablePromotions.map(promo => {
        let text = '';
        if (promo.discountType === 'percentage') {
          text = `-${promo.discountValue}% avec ${promo.code}`;
        } else if (promo.discountType === 'fixed') {
          text = `-${promo.discountValue}€ avec ${promo.code}`;
        } else if (promo.code) {
          text = `Code: ${promo.code}`;
        }
        console.log(`      📝 Texte généré: "${text}"`);
        return text;
      }).filter(text => text.length > 0);
      
      console.log(`   📋 Textes finaux: [${texts.join(', ')}]`);
      return texts;
    };

    // Computed pour obtenir tous les textes de promotions dynamiques (global)
    const promotionTexts = computed(() => {
      if (activePromotions.value.length === 0) {
        return []; // Pas de texte si pas de promotion
      }
      
      // Traiter toutes les promotions actives
      return activePromotions.value.map(promo => {
        let text = '';
        if (promo.discountType === 'percentage') {
          text = `-${promo.discountValue}% avec ${promo.code}`;
        } else if (promo.discountType === 'fixed') {
          text = `-${promo.discountValue}€ avec ${promo.code}`;
        } else if (promo.code) {
          text = `Code: ${promo.code}`;
        }
        return text;
      }).filter(text => text.length > 0); // Filtrer les textes vides
    });

    // Computed pour obtenir le texte de promotion principal (première promotion pour compatibilité)
    const promotionText = computed(() => {
      return promotionTexts.value.length > 0 ? promotionTexts.value[0] : '';
    });

    // Wrapper pour les recherches manuelles (clic sur bouton)
    const handleManualSubmit = async () => {
      isManualSearch.value = true;
      
      // Si on recherche des promotions, recharger les promotions actives
      if (onPromotion.value) {
        console.log('🎫 Recherche avec filtre promotion - rechargement des promotions...');
        await loadActivePromotions();
      }
      
      handleSubmit();
    };

    // Fonction pour construire l'URL des images
    const getImageUrl = (imageUrl: string) => {
      if (!imageUrl) return '';
      if (imageUrl.startsWith('http')) return imageUrl;
      
      // Construire l'URL de base sans /api pour les images
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      const fullUrl = `${baseUrl}${imageUrl}`;
      console.log('Image URL construite:', fullUrl);
      return fullUrl;
    };

    // Gestionnaire d'erreur pour les images
    const handleImageError = (event: Event) => {
      const target = event.target as HTMLImageElement;
      target.style.display = 'none';
      // Afficher l'icône SVG de fallback
      const parent = target.parentElement;
      if (parent) {
        const svg = parent.querySelector('svg');
        if (svg) {
          svg.style.display = 'block';
        }
      }
    };

    // Gestionnaire de succès pour les images
    const handleImageLoad = (event: Event) => {
      console.log('✅ Image chargée avec succès:', event);
    };

    // Fonction pour ajouter un produit au panier
    const addToCart = async (product: Product) => {
      try {
        await addProductToCart(product.productId, 1);
        
        // Afficher notification de succès
        showSuccess('🛒 Produit ajouté !', `${product.name} a été ajouté à votre panier`);
        
        console.log(`Produit ${product.name} ajouté au panier`);
      } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
        
        // Afficher notification d'erreur
        showError('❌ Erreur', 'Impossible d\'ajouter le produit au panier');
      }
    };

    // Fonction pour effacer tous les filtres
    const clearAllFilters = () => {
      handleChange('globalSearch', '');
      handleChange('name', '');
      handleChange('description', '');
      handleChange('category', '');
      handleChange('priceMin', 0);
      handleChange('priceMax', 0);
      handleChange('inStock', false);
      handleChange('onPromotion', false);
      
      // Effacer l'URL aussi
      router.push({ name: 'ProductSearch', query: {} });
      
      // Réinitialiser les produits
      products.value = [];
      hasSearched.value = false;
      isManualSearch.value = false;
    };

    // Computed pour savoir s'il y a des filtres actifs
    const hasActiveFilters = computed(() => {
      return !!(
        globalSearch.value ||
        name.value ||
        description.value ||
        category.value ||
        (priceMin.value && priceMin.value > 0) ||
        (priceMax.value && priceMax.value > 0) ||
        inStock.value ||
        onPromotion.value
      );
    });

    // Computed pour savoir si on doit afficher le badge promotion
    const shouldShowPromoBadge = computed(() => {
      return onPromotion.value && 
             isManualSearch.value && 
             hasSearched.value && 
             products.value.length > 0;
    });

    // Computed pour savoir si on doit afficher le texte de promotion
    const shouldShowPromoText = computed(() => {
      // Afficher le texte de promotion seulement s'il y a un badge ET au moins un texte de promotion
      return shouldShowPromoBadge.value && promotionTexts.value.length > 0;
    });

    // Watcher pour les changements de route
    watch(route, () => {
      handleChange('globalSearch', route.query.q || route.query.search || '');
      handleChange('name', route.query.name || '');
      handleChange('description', route.query.description || '');
      handleChange('category', route.query.category || '');
      handleChange('priceMin', route.query.priceMin ? parseFloat(route.query.priceMin as string) : 0);
      handleChange('priceMax', route.query.priceMax ? parseFloat(route.query.priceMax as string) : 0);
      handleChange('inStock', route.query.inStock === 'true');
      handleChange('onPromotion', route.query.onPromotion === 'true');
      // Ne soumettre que si on vient d'une URL avec des paramètres
      if (Object.keys(route.query).length > 0) {
        handleSubmit();
      }
    }, { immediate: true });

    onMounted(() => {
      loadCategories();
      loadActivePromotions();
      handleSubmit();
    });

    return {
      products,
      categories,
      showAdvancedFilters,
      hasSearched,
      isManualSearch,
      promotionText,
      promotionTexts,
      getPromotionTextsForProduct,
      hasActiveFilters,
      shouldShowPromoBadge,
      shouldShowPromoText,
      globalSearch,
      name,
      description,
      category,
      priceMin,
      priceMax,
      inStock,
      onPromotion,
      nameError,
      descriptionError,
      categoryError,
      priceMinError,
      priceMaxError,
      inStockError,
      isSubmitting,
      serverError,
      handleChange,
      handleSubmit,
      handleManualSubmit,
      handlePriceChange,
      handleGlobalSearchChange,
      getImageUrl,
      handleImageError,
      handleImageLoad,
      addToCart,
      clearAllFilters,
    };
  },
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
