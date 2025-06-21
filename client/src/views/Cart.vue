<template>
  <!-- 🛒 Page Panier - Design Aurora Épuré -->
  <main class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-16">
    <div class="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
      
      <!-- En-tête -->
      <div class="text-center mb-16">
        <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8.5M19 13v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" />
          </svg>
        </div>
        <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Mon Panier</h1>
        <p class="text-lg text-gray-600">Vérifiez vos articles avant de procéder au paiement</p>
      </div>

      <!-- Contenu du panier -->
      <div v-if="cart && cart.CartItems.length > 0" class="space-y-12">
        
        <!-- Liste des produits -->
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <!-- En-têtes (Desktop) -->
          <div class="hidden md:grid md:grid-cols-12 gap-6 px-10 py-6 bg-gray-50/80 border-b border-gray-200/50">
            <div class="col-span-5 text-base font-semibold text-gray-700">Produit</div>
            <div class="col-span-2 text-base font-semibold text-gray-700 text-center">Prix</div>
            <div class="col-span-2 text-base font-semibold text-gray-700 text-center">Quantité</div>
            <div class="col-span-2 text-base font-semibold text-gray-700 text-center">Total</div>
            <div class="col-span-1 text-base font-semibold text-gray-700 text-center">Action</div>
          </div>

          <!-- Articles du panier -->
          <div class="divide-y divide-gray-200/50">
            <div v-for="product in cart.CartItems" :key="product.id" class="p-8 md:p-10">
              
              <!-- Version Mobile -->
              <div class="md:hidden space-y-6">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold text-gray-900">{{ product.Product.name }}</h3>
                    <p class="text-base text-gray-500 mt-2">{{ product.Product.category }}</p>
                  </div>
                  <confirm-button
                    :delete-url="`/cart/remove/${product.Product.id}`"
                    :on-success="loadCart"
                    button-class="ml-6 inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </confirm-button>
                </div>
                
                <div class="flex justify-between items-center bg-gray-50/50 rounded-2xl p-6">
                  <div class="text-center">
                    <p class="text-sm text-gray-500 mb-2">Prix unitaire</p>
                    <p class="text-xl font-semibold text-gray-900">{{ (product.price / product.quantity / 100).toFixed(2) }} €</p>
                  </div>
                  <div class="text-center">
                    <p class="text-sm text-gray-500 mb-2">Quantité</p>
                    <div class="inline-flex items-center px-4 py-3 bg-white rounded-xl border border-gray-200">
                      <span class="text-xl font-semibold text-gray-900">{{ product.quantity }}</span>
                    </div>
                  </div>
                  <div class="text-center">
                    <p class="text-sm text-gray-500 mb-2">Total</p>
                    <p class="text-xl font-bold text-blue-600">{{ (product.price / 100).toFixed(2) }} €</p>
                  </div>
                </div>
              </div>

              <!-- Version Desktop -->
              <div class="hidden md:grid md:grid-cols-12 gap-6 items-center">
                <div class="col-span-5 flex items-center space-x-6">
                  <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold text-gray-900">{{ product.Product.name }}</h3>
                    <p class="text-base text-gray-500 mt-1">{{ product.Product.category }}</p>
                  </div>
                </div>
                
                <div class="col-span-2 text-center">
                  <p class="text-xl font-semibold text-gray-900">{{ (product.price / product.quantity / 100).toFixed(2) }} €</p>
                </div>
                
                <div class="col-span-2 text-center">
                  <div class="inline-flex items-center px-6 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <span class="text-xl font-semibold text-gray-900">{{ product.quantity }}</span>
                  </div>
                </div>
                
                <div class="col-span-2 text-center">
                  <p class="text-xl font-bold text-blue-600">{{ (product.price / 100).toFixed(2) }} €</p>
                </div>
                
                <div class="col-span-1 text-center">
                  <confirm-button
                    :delete-url="`/cart/remove/${product.Product.id}`"
                    :on-success="loadCart"
                    button-class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </confirm-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Code Promo -->
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-10">
          <PromoCodeInput 
            :cart-total="cart.totalPrice"
            :cart-items="cart.CartItems"
            @promo-applied="onPromoApplied"
            @promo-removed="onPromoRemoved"
          />
        </div>

        <!-- Résumé et Actions -->
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-10">
          <!-- Total -->
          <div class="flex justify-between items-center py-6 border-b border-gray-200/50">
            <span class="text-2xl font-semibold text-gray-900">Total</span>
            <span class="text-3xl font-bold text-blue-600">{{ (finalTotal / 100).toFixed(2) }} €</span>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-6 mt-10">
            <confirm-button
              :delete-url="'/cart/clear'"
              :on-success="loadCart"
              button-text="Vider le panier"
              button-class="flex-1 inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
            />
            
            <button 
              @click="handleCheckout" 
              class="flex-1 inline-flex items-center justify-center rounded-2xl px-8 py-5 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
            >
              <span>Procéder au paiement</span>
              <svg class="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Panier vide -->
      <div v-else class="text-center py-20">
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-16">
          <div class="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8.5M19 13v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" />
            </svg>
          </div>
          <h3 class="text-3xl font-bold text-gray-900 mb-6">Votre panier est vide</h3>
          <p class="text-lg text-gray-600 mb-10">Découvrez notre collection de mugs et ajoutez vos favoris !</p>
          <router-link 
            to="/" 
            class="inline-flex items-center justify-center rounded-2xl px-10 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
          >
            <svg class="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Découvrir nos produits
          </router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { getCart } from '../services/cartService';
import { createCheckoutSession, clearCartAfterPayment  } from '../services/stripeService';
import { loadStripe } from '@stripe/stripe-js';
import ConfirmButton from '../components/ConfirmButton.vue';
import PromoCodeInput from '../components/PromoCodeInput.vue';
import { useNotifications } from '../composables/useNotifications';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default defineComponent({
  name: 'Cart',
  components: { ConfirmButton, PromoCodeInput },
  setup() {
    const { addNotification } = useNotifications();
    const cart = ref<any | null>(null);
    const appliedPromo = ref<any | null>(null);
    const promoDiscount = ref(0);

    const finalTotal = computed(() => {
      if (!cart.value) return 0;
      return Math.max(0, cart.value.totalPrice - promoDiscount.value);
    });

    const loadCart = async () => {
      cart.value = await getCart();
    };

    const onPromoApplied = (promoData: any) => {
      appliedPromo.value = promoData;
      // La réduction est déjà en euros, la convertir en centimes pour cohérence avec totalPrice
      promoDiscount.value = promoData.discount * 100;
    };

    const onPromoRemoved = () => {
      appliedPromo.value = null;
      promoDiscount.value = 0;
    };

    const handleCheckout = async () => {
      try {
        const stripe = await stripePromise;
        await loadCart(); 
        
        // Préparer les données de checkout avec promotion
        const checkoutData = {
          cartItems: cart.value.CartItems,
          appliedPromo: appliedPromo.value,
          finalTotal: finalTotal.value
        };
        
        const session = await createCheckoutSession(checkoutData);

        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
          if (!error) {
            await clearCartAfterPayment(); 
            loadCart(); 
          }
        }
      } catch (error: any) {
        addNotification(error.response?.data?.message || 'Erreur lors de la création de la session de paiement', 'error');
        loadCart();
      }
    };

    onMounted(loadCart);

    return {
      cart,
      finalTotal,
      appliedPromo,
      promoDiscount,
      handleCheckout,
      loadCart,
      onPromoApplied,
      onPromoRemoved,
    };
  },
});
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
