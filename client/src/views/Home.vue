<template>
  <!-- 🏠 Page d'accueil Aurora - 100% Tailwind CSS -->
  <div class="home">
    <!-- 🌟 Hero Section avec gradient et animations -->
    <section class="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <!-- Background decoratif -->
      <div class="absolute inset-0 bg-mesh opacity-10"></div>
      <div class="absolute inset-0 bg-dots opacity-5"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div class="text-center">
          <!-- Titre principal avec gradient -->
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-gradient mb-6 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]">
            Le Monde des Mugs
        </h1>
          
          <!-- Sous-titre -->
          <p class="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards]">
            Découvrez notre collection exceptionnelle de mugs artisanaux en bois, bambou, verre et plastique. 
            Chaque pièce raconte une histoire unique.
          </p>
          
          <!-- Badges de confiance -->
          <div class="flex flex-wrap justify-center gap-4 mb-12 opacity-0 animate-[fadeIn_0.8s_ease-out_0.6s_forwards]">
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.5 21L3 16.5l1.5-1.5L7.5 18l7.5-7.5L16.5 12L7.5 21z" />
              </svg>
              Qualité Premium
            </div>
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Livraison Rapide
            </div>
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Fait avec Amour
            </div>
          </div>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-[fadeIn_0.8s_ease-out_0.8s_forwards]">
            <button 
              @click="scrollToProducts"
              class="inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Voir les Produits
            </button>
          </div>
        </div>
      </div>
      
      <!-- Floating elements -->
      <div class="absolute top-20 left-10 w-20 h-20 bg-primary-200 dark:bg-primary-800 rounded-full opacity-20 animate-[float_6s_ease-in-out_infinite]"></div>
      <div class="absolute bottom-20 right-10 w-16 h-16 bg-secondary-200 dark:bg-secondary-800 rounded-full opacity-20 animate-[float_6s_ease-in-out_1s_infinite]"></div>
      <div class="absolute top-1/2 left-1/4 w-12 h-12 bg-accent-200 dark:bg-accent-800 rounded-full opacity-20 animate-[float_6s_ease-in-out_2s_infinite]"></div>
    </section>
    
    <!-- 🎯 Section Produits Vedettes -->
    <section ref="productsSection" class="py-24 bg-white dark:bg-neutral-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header de section -->
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Nos Produits 
            <span class="text-gradient-accent">Vedettes</span>
          </h2>
          <p class="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Une sélection soigneusement choisie de nos meilleures créations, 
            alliant esthétique moderne et fonctionnalité exceptionnelle.
          </p>
        </div>
        
        <!-- Grille de produits -->
        <div v-if="featuredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(product, index) in featuredProducts"
            :key="product.productId"
            class="group bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 rounded-2xl shadow-lg hover:shadow-xl p-6 hover:scale-105 transition-all duration-300 ease-in-out hover:-translate-y-1 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <!-- Image avec gestion d'erreur -->
            <div class="w-full h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 rounded-xl mb-6 flex items-center justify-center group-hover:from-primary-100 group-hover:to-secondary-100 dark:group-hover:from-primary-900/20 dark:group-hover:to-secondary-900/20 transition-all duration-300 overflow-hidden">
              <img 
                v-if="product.imageUrl" 
                :src="getImageUrl(product.imageUrl)" 
                :alt="product.name"
                class="w-full h-full object-cover rounded-xl"
                @error="handleImageError"
              />
              <svg v-else class="w-16 h-16 text-neutral-400 dark:text-neutral-600 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            
            <!-- Contenu du produit -->
            <div class="space-y-4">
              <div class="flex items-start justify-between">
                <h3 class="text-xl font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {{ product.name }}
                </h3>
                <div class="flex items-center space-x-1">
                  <span v-if="product.stock > 0" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300">
                    En stock
                  </span>
                  <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Épuisé
                  </span>
                </div>
              </div>
              
              <p class="text-neutral-600 dark:text-neutral-400 line-clamp-2">
                {{ product.description }}
              </p>
              
              <!-- Prix et stock -->
              <div class="flex items-center justify-between">
                <div class="text-2xl font-bold text-gradient">
                  {{ (product.price / 100).toFixed(2) }} €
                </div>
                <div class="text-sm text-neutral-500 dark:text-neutral-400">
                  {{ product.stock }} disponible{{ product.stock > 1 ? 's' : '' }}
                </div>
              </div>
              
              <!-- Bouton d'action -->
              <div class="pt-4">
              <button
                v-if="isAuthenticated"
                  @click="addToCartHandler(product.productId)"
                  :disabled="product.stock === 0"
                  class="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold w-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="product.stock === 0 ? 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:ring-neutral-500 cursor-not-allowed' : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl focus:ring-primary-500 transform hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]'"
                >
                  <svg v-if="product.stock > 0" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8.5M19 13v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" />
                  </svg>
                  <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {{ product.stock === 0 ? 'Stock épuisé' : 'Ajouter au panier' }}
                </button>
                
                <div v-else class="text-center">
                  <p class="text-neutral-600 dark:text-neutral-400 mb-3">
                    Connectez-vous pour commander
                  </p>
                  <router-link to="/login" class="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold w-full border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Se connecter
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- État de chargement -->
        <div v-else class="text-center py-16">
          <div class="animate-pulse">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 animate-bounce"></div>
            <p class="text-lg text-neutral-600 dark:text-neutral-400">
              Chargement des produits...
            </p>
          </div>
        </div>
        </div>
      </section>
    
    <!-- 💎 Section Avantages -->
    <section class="py-24 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-800 dark:to-neutral-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Pourquoi Choisir 
            <span class="text-gradient">Le Monde des Mugs</span> ?
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Avantage 1 -->
          <div class="text-center group">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.5 21L3 16.5l1.5-1.5L7.5 18l7.5-7.5L16.5 12L7.5 21z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
              Qualité Garantie
            </h3>
            <p class="text-neutral-600 dark:text-neutral-400">
              Chaque produit est soigneusement sélectionné et testé pour vous offrir la meilleure qualité.
            </p>
    </div>
    
          <!-- Avantage 2 -->
          <div class="text-center group">
            <div class="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
              Livraison Express
            </h3>
            <p class="text-neutral-600 dark:text-neutral-400">
              Recevez vos commandes rapidement grâce à notre réseau de livraison optimisé.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchProducts } from '../services/productService';
import { Product } from '../types/Product';
import { addToCart } from '../services/cartService';
import { useAuth } from '../composables/useAuth';
import { useNotifications } from '../composables/useNotifications';

export default defineComponent({
  name: 'Home',
  setup() {
    const featuredProducts = ref<Product[]>([]);
    const productsSection = ref<HTMLElement>();
    const { isAuthenticated } = useAuth();
    const { showSuccess, showError } = useNotifications();

    const loadProducts = async () => {
      try {
      const allProducts = await fetchProducts();
        console.log('Produits récupérés:', allProducts);
        // Limiter à 6 produits vedettes pour un affichage plus clean
        featuredProducts.value = allProducts.filter(product => product.onSale).slice(0, 6);
        console.log('Produits vedettes avec images:', featuredProducts.value.map(p => ({
          name: p.name,
          imageUrl: p.imageUrl,
          fullImageUrl: getImageUrl(p.imageUrl || '')
        })));
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        showError('❌ Erreur', 'Impossible de charger les produits');
      }
    };

    const addToCartHandler = async (productId: number) => {
      try {
        await addToCart(productId, 1);
        
        // Trouver le produit pour afficher son nom dans la notification
        const product = featuredProducts.value.find(p => p.productId === productId);
        const productName = product ? product.name : 'Le produit';
        
        // Afficher notification de succès avec style moderne
        showSuccess('🛒 Ajouté au panier !', `${productName} a été ajouté avec succès`);
        
      } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
        showError('❌ Erreur', 'Impossible d\'ajouter le produit au panier');
      }
    };

    const scrollToProducts = () => {
      if (productsSection.value) {
        productsSection.value.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    const getImageUrl = (imageUrl: string) => {
      if (!imageUrl) return '';
      if (imageUrl.startsWith('http')) return imageUrl;
      
      // Construire l'URL de base sans /api pour les images
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      const fullUrl = `${baseUrl}${imageUrl}`;
      console.log('Image URL construite:', fullUrl);
      return fullUrl;
    };

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

    onMounted(loadProducts);

    return {
      featuredProducts,
      productsSection,
      isAuthenticated,
      addToCartHandler,
      scrollToProducts,
      getImageUrl,
      handleImageError,
    };
  },
});
</script>
