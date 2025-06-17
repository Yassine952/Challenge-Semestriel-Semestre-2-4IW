<template>
  <section class="py-24 relative">
    <div v-if="cart && cart.CartItems.length > 0">
      <div class="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto">
        <h2 class="title font-manrope font-bold text-4xl leading-10 mb-8 text-center text-black">Panier</h2>
        <div class="hidden lg:grid grid-cols-2 py-6">
          <div class="font-normal text-xl leading-8 text-gray-500">Produit</div>
          <p class="font-normal text-xl leading-8 text-gray-500 flex items-center justify-between">
            <span class="w-full max-w-[200px] text-center">Prix</span>
            <span class="w-full max-w-[260px] text-center">Quantité</span>
            <span class="w-full max-w-[200px] text-center">Total</span>
          </p>
        </div>

        <div v-for="product in cart.CartItems" :key="product.id" class="grid grid-cols-1 lg:grid-cols-2 min-[550px]:gap-6 border-t border-gray-200 py-6">
          <div class="flex items-center flex-col min-[550px]:flex-row gap-3 min-[550px]:gap-6 w-full max-xl:justify-center max-xl:max-w-xl max-xl:mx-auto">

            <div class="pro-data w-full max-w-sm">
              <h5 class="font-semibold text-xl leading-8 text-black max-[550px]:text-center">{{ product.Product.name }}</h5>
              <p class="font-normal text-lg leading-8 text-gray-500 my-2 min-[550px]:my-3 max-[550px]:text-center">{{ product.Product.category }}</p>
              <h6 class="font-medium text-lg leading-8 text-indigo-600 max-[550px]:text-center"></h6>
            </div>
          </div>
          <div class="flex items-center flex-col min-[550px]:flex-row w-full max-xl:max-w-xl max-xl:mx-auto gap-2">
            <h6 class="font-manrope font-bold text-2xl leading-9 text-black w-full max-w-[176px] text-center">{{ product.price / product.quantity }}  €<span class="text-sm text-gray-300 ml-3 lg:hidden whitespace-nowrap">(Delivery Charge)</span></h6>
            <div class="flex items-center w-full mx-auto justify-center">
              <input type="text" class="border-y border-gray-200 outline-none text-gray-900 font-semibold text-lg w-full max-w-[118px] min-w-[80px] placeholder:text-gray-900 py-[15px] text-center bg-transparent" :value="product.quantity" readonly>
            </div>
            <h6 class="text-indigo-600 font-manrope font-bold text-2xl leading-9 w-full max-w-[176px] text-center">{{ product.price }} €</h6>
          </div>
          <confirm-button
              :delete-url="`/cart/remove/${product.Product.id}`"
              :on-success="loadCart"
              button-text="Retirer"
            />
        </div>

          <div class="flex items-center justify-between w-full py-6">
            <p class="font-manrope font-medium text-2xl leading-9 text-gray-900">Total</p>
            <h6 class="font-manrope font-medium text-2xl leading-9 text-indigo-500">{{ cart.totalPrice }} €</h6>
          </div>
        </div>
        <div class="flex items-center flex-col sm:flex-row justify-center gap-3 mt-8">
          
             <confirm-button
        :delete-url="'/cart/clear'"
        :on-success="loadCart"
        button-text="Vider le panier"
      
        />
          <button @click="handleCheckout" class="rounded-full w-full max-w-[280px] py-4 text-center justify-center items-center bg-indigo-600 font-semibold text-lg text-white flex transition-all duration-500 hover:bg-indigo-700">
            Continue to Payment
            <svg class="ml-2" xmlns="http://www.w3.org/2000/svg" width="23" height="22" viewBox="0 0 23 22" fill="none">
              <path d="M8.75324 5.49609L14.2535 10.9963L8.75 16.4998" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-else>
        <main class="w-full h-screen flex flex-col items-center justify-center px-4">
          <div class="max-w-lg mx-auto space-y-3 text-center">
            <h3 class="text-gray-800 text-4xl font-semibold sm:text-5xl">Votre panier est vide</h3>
            <p class="text-gray-600">Il semble que vous n'ayez pas encore ajouté d'articles à votre panier.</p>
            <router-link to="/" class="text-indigo-600 duration-150 hover:text-indigo-400 font-medium inline-flex items-center gap-x-1">
              Retourner à l'accueil
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clip-rule="evenodd" />
              </svg>
            </router-link>
          </div>
        </main>
      </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getCart } from '../services/cartService';
import { createCheckoutSession, clearCartAfterPayment  } from '../services/stripeService';
import { loadStripe } from '@stripe/stripe-js';
import ConfirmButton from '../components/ConfirmButton.vue';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default defineComponent({
  name: 'Cart',
  components: { ConfirmButton },
  setup() {
    const cart = ref<any | null>(null);
    const errorMessage = ref<string | null>(null);

    const loadCart = async () => {
      cart.value = await getCart();
    };

    const handleCheckout = async () => {
      try {
        const stripe = await stripePromise;
        await loadCart(); 
        const session = await createCheckoutSession(cart.value.CartItems);

        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
          if (!error) {
            await clearCartAfterPayment(); 
            loadCart(); 
          }
        }
      } catch (error: any) {
        errorMessage.value = error.response?.data?.message || 'Erreur lors de la création de la session de paiement';
        loadCart();
      }
    };

    onMounted(loadCart);

    return {
      cart,
      errorMessage,
      handleCheckout,
      loadCart,
    };
  },
});
</script>

<style scoped>
</style>
