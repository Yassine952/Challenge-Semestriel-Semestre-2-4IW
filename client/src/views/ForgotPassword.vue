<template>
  <main class="w-full h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
    <div class="w-full space-y-6 text-gray-600 sm:max-w-md">
      <div class="text-center">
        <div class="mt-5 space-y-2">
          <h3 class="text-gray-800 text-2xl font-bold sm:text-3xl">
            Mot de passe oublié
          </h3>
        </div>
      </div>
      <div class="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
        <form @submit.prevent="requestPasswordReset" class="space-y-5">
          <div>
            <label for="email" class="font-medium">Email</label>
            <input
              type="email"
              v-model="email"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <button
            type="submit"
            class="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
          >
            Demander la réinitialisation
          </button>
        </form>
        <p v-if="message" class="mt-4 text-green-500">{{ message }}</p>
        <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ForgotPassword',
  setup() {
    const email = ref('');
    const message = ref('');
    const error = ref('');

    const requestPasswordReset = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.value }),
        });

        const data = await response.json();

        if (response.ok) {
          message.value = 'Email de réinitialisation du mot de passe envoyé. Veuillez vérifier votre email.';
          error.value = '';
        } else {
          error.value = data.errors ? data.errors.map(err => err.msg).join(', ') : `La demande a échoué: ${data.message}`;
          message.value = '';
        }
      } catch (err) {
        error.value = `La demande a échoué: ${err.message}`;
        message.value = '';
      }
    };

    return {
      email,
      message,
      error,
      requestPasswordReset,
    };
  },
});
</script>
