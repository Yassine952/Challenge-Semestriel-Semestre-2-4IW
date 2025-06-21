<template>
  <main class="w-full h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
    <div class="w-full space-y-6 text-gray-600 sm:max-w-md">
      <div class="text-center">
        <div class="mt-5 space-y-2">
          <h3 class="text-gray-800 text-2xl font-bold sm:text-3xl">
            Recherche de produits
          </h3>
        </div>
      </div>
      <div class="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
        <!-- Barre de recherche globale -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <label for="globalSearch" class="font-medium text-lg">🔍 Recherche globale</label>
          <input
            type="text"
            v-model="globalSearch"
            @input="handleGlobalSearchChange($event.target.value)"
            placeholder="Rechercher dans les noms et descriptions..."
            class="w-full mt-2 px-4 py-3 text-gray-700 bg-white outline-none border-2 focus:border-indigo-600 shadow-sm rounded-lg text-lg"
          />
          <p class="text-sm text-gray-500 mt-1">Recherche dans les noms et descriptions des produits</p>
        </div>

        <!-- Filtres avancés (repliables) -->
        <div class="mb-4">
          <button 
            type="button"
            @click="showAdvancedFilters = !showAdvancedFilters"
            class="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {{ showAdvancedFilters ? '▼' : '▶' }} Filtres avancés
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div v-show="showAdvancedFilters" class="space-y-5 border-t pt-5">
            <div>
              <label for="name" class="font-medium">Nom spécifique</label>
            <input
              type="text"
              v-model="name"
              @input="handleChange('name', $event.target.value)"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="nameError" class="text-red-500">{{ nameError }}</span>
          </div>
                      <div>
              <label for="description" class="font-medium">Description spécifique</label>
              <input
                type="text"
                v-model="description"
                @input="handleChange('description', $event.target.value)"
                placeholder="Rechercher dans les descriptions..."
                class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
              <span v-if="descriptionError" class="text-red-500">{{ descriptionError }}</span>
            </div>
          <div>
            <label for="category" class="font-medium">Catégorie</label>
            <select
              v-model="category"
              @change="handleChange('category', $event.target.value)"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <span v-if="categoryError" class="text-red-500">{{ categoryError }}</span>
          </div>
          <div>
            <label for="priceMin" class="font-medium">Prix minimum (€)</label>
            <input
              type="number"
              :value="priceMin || ''"
              @input="handlePriceChange('priceMin', $event.target.value)"
              step="0.01"
              min="0"
              placeholder="Ex: 10.50"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="priceMinError" class="text-red-500">{{ priceMinError }}</span>
          </div>
          <div>
            <label for="priceMax" class="font-medium">Prix maximum (€)</label>
            <input
              type="number"
              :value="priceMax || ''"
              @input="handlePriceChange('priceMax', $event.target.value)"
              step="0.01"
              min="0"
              placeholder="Ex: 50.00"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="priceMaxError" class="text-red-500">{{ priceMaxError }}</span>
          </div>
          <div class="flex items-center space-x-6">
            <div class="flex items-center">
              <input
                type="checkbox"
                v-model="inStock"
                id="inStock"
                @input="handleChange('inStock', $event.target.checked)"
                class="mr-2"
              />
              <label for="inStock" class="font-medium">En stock</label>
            </div>
            <div class="flex items-center">
              <input
                type="checkbox"
                v-model="onPromotion"
                id="onPromotion"
                @input="handleChange('onPromotion', $event.target.checked)"
                class="mr-2"
              />
              <label for="onPromotion" class="font-medium">En promotion</label>
            </div>
          </div>
          </div>
          
          <button
            type="button"
            @click="handleManualSubmit"
            :disabled="isSubmitting"
            class="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
          >
            🔍 Rechercher
          </button>
          <p v-if="serverError" class="error mt-4 text-red-500">{{ serverError }}</p>
        </form>
        <div v-if="products.length === 0" class="mt-6 text-center text-gray-600">
          Aucun produit trouvé.
        </div>
        <ul v-else class="mt-6 space-y-3">
          <li v-for="product in products" :key="product.productId" class="bg-white p-4 shadow rounded-lg relative">
            <!-- Badge promotion (seulement si recherche manuelle avec filtre promotion ET produits trouvés) -->
            <div v-if="onPromotion && isManualSearch && products.length > 0" class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              🎫 En promotion
            </div>
            <h4 class="font-semibold text-gray-800">{{ product.name }}</h4>
            <p class="text-gray-600">{{ product.description }}</p>
            <div class="flex justify-between items-center mt-2">
              <div class="flex items-center space-x-2">
                <p class="text-gray-800 font-medium text-lg">{{ (product.price / 100).toFixed(2) }} €</p>
                <span v-if="onPromotion && isManualSearch && products.length > 0 && promotionText" class="text-green-600 text-sm font-medium">{{ promotionText }}</span>
              </div>
              <button 
                @click="addToCart(product)"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 7.2M7 13l-1.8 7.2m0 0h12.6m-12.6 0L5.4 5M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8"></path>
                </svg>
                <span>Ajouter au panier</span>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
    

  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';
import { searchProducts, fetchCategories } from '../services/productService';
import { addToCart as addProductToCart } from '../services/cartService';
import { fetchActivePromotionsForProduct } from '../services/promotionService';
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
        activePromotions.value = await fetchActivePromotionsForProduct();
        console.log('🎫 Promotions actives chargées:', activePromotions.value);
      } catch (error) {
        console.error('Error fetching active promotions:', error);
      }
    };

    // Wrapper pour les recherches manuelles (clic sur bouton)
    const handleManualSubmit = () => {
      isManualSearch.value = true;
      handleSubmit();
    };

    // Computed pour obtenir le texte de promotion dynamique
    const promotionText = computed(() => {
      console.log('🎫 Calcul promotionText - Promotions:', activePromotions.value.length);
      if (activePromotions.value.length === 0) {
        console.log('🎫 Aucune promotion active');
        return '';
      }
      
      const promo = activePromotions.value[0]; // Prendre la première promotion active
      console.log('🎫 Promotion utilisée:', promo);
      
      let text = '';
      if (promo.discountType === 'percentage') {
        text = `-${promo.discountValue}% avec ${promo.code}`;
      } else {
        text = `-${promo.discountValue}€ avec ${promo.code}`;
      }
      
      console.log('🎫 Texte généré:', text);
      return text;
    });

    // Fonction supprimée - recherche par marque désactivée

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
      addToCart,
    };
  },
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
