<!-- src/views/Cart.vue -->
<template>
  <div>
    <h1>Votre panier</h1>
    <div v-if="cart && cart.CartItems.length > 0">
      <ul>
        <li v-for="item in cart.CartItems" :key="item.id">
          {{ item.Product.name }} - {{ item.quantity }} x {{ item.price / item.quantity }} = {{ item.price }}
          <button @click="removeFromCart(item.Product.id)">Retirer</button>
        </li>
      </ul>
      <p>Total: {{ cart.totalPrice }}</p>
      <button @click="clearCart">Vider le panier</button>
      <button @click="handleCheckout">Payer</button>
    </div>
    <div v-else>
      <p>Votre panier est vide</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getCart, removeFromCart, clearCart } from '../services/cartService';
import { createCheckoutSession } from '../services/stripeService';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default defineComponent({
  name: 'Cart',
  setup() {
    const cart = ref<any | null>(null);

    const loadCart = async () => {
      cart.value = await getCart();
    };

    const removeItem = async (productId: number) => {
      await removeFromCart(productId);
      loadCart();
    };

    const clearCartItems = async () => {
      await clearCart();
      loadCart();
    };

    const handleCheckout = async () => {
      const stripe = await stripePromise;
      const session = await createCheckoutSession(cart.value.CartItems);

      if (stripe) {
        stripe.redirectToCheckout({ sessionId: session.id });
      }
    };

    onMounted(loadCart);

    return {
      cart,
      removeFromCart: removeItem,
      clearCart: clearCartItems,
      handleCheckout,
    };
  },
});
</script>
