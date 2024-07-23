<template>
  <div>
    <h1>Votre panier</h1>
    <div v-if="cart && cart.CartItems.length > 0">
      <ul>
        <li v-for="item in cart.CartItems" :key="item.id">
          {{ item.Product.name }} - {{ item.quantity }} x {{ item.price / item.quantity }} = {{ item.price }}
          <confirm-button
            :delete-url="`/api/cart/remove/${item.Product.id}`"
            :on-success="loadCart"
            button-text="Retirer"
          />
        </li>
      </ul>
      <p>Total: {{ cart.totalPrice }}</p>
      <confirm-button
        :delete-url="'/api/cart/clear'"
        :on-success="loadCart"
        button-text="Vider le panier"
      />
      <button @click="handleCheckout">Payer</button>
    </div>
    <div v-else>
      <p>Votre panier est vide</p>
    </div>
  </div>
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
