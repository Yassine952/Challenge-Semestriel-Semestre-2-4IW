<template>
    <div>
      <button @click="handleCheckout">Payer</button>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { loadStripe } from '@stripe/stripe-js';
  
  export default defineComponent({
    name: 'Checkout',
    setup() {
      const handleCheckout = async () => {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  
        const response = await fetch(`${import.meta.env.VITE_API_URL}/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            items: [
              {
                name: 'Product 1',
                description: 'Description of Product 1',
                price: 1000, 
                quantity: 1
              }
            ]
          })
        });
  
        const session = await response.json();
  
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: session.id
          });
  
          if (error) {
            console.error('Error redirecting to checkout:', error);
          }
        }
      };
  
      return {
        handleCheckout
      };
    }
  });
  </script>
  