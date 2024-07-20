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
import { createCheckoutSession, clearCartAfterPayment } from '../services/stripeService';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default defineComponent({
  name: 'Cart',
  setup() {
    const cart = ref<any | null>(null);
    const errorMessage = ref<string | null>(null);

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
      try {
        const stripe = await stripePromise;
        await loadCart(); // Ensure cart is updated before checking out
        const session = await createCheckoutSession(cart.value.CartItems);

        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
          if (!error) {
            await clearCartAfterPayment(); // Clear the cart after a successful payment
            loadCart(); // Refresh the cart to show it's empty
          }
        }
      } catch (error: any) {
        errorMessage.value = error.response?.data?.message || 'Erreur lors de la création de la session de paiement';
        loadCart(); // Refresh the cart to reflect any expired items
      }
    };

    onMounted(loadCart);

    return {
      cart,
      errorMessage,
      removeFromCart: removeItem,
      clearCart: clearCartItems,
      handleCheckout,
    };
  },
});
</script>
