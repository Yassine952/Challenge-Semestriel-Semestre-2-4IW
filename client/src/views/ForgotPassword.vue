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
            :disabled="isLoading"
            class="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ isLoading ? 'Envoi en cours...' : 'Demander la réinitialisation' }}
          </button>
        </form>

      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useNotifications } from '../composables/useNotifications';

export default defineComponent({
  name: 'ForgotPassword',
  setup() {
    const { showSuccess, showError } = useNotifications();
    const email = ref('');
    const isLoading = ref(false);

    const requestPasswordReset = async () => {
      if (isLoading.value) return;
      
      isLoading.value = true;
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
          showSuccess('Email envoyé', 'Un email de réinitialisation du mot de passe a été envoyé. Veuillez vérifier votre boîte de réception.');
          email.value = ''; // Réinitialiser le formulaire
        } else {
          const errorMessage = data.errors 
            ? data.errors.map(err => err.msg).join(', ') 
            : data.message || 'Erreur lors de la demande de réinitialisation';
          showError('Erreur', errorMessage);
        }
      } catch (error: any) {
        showError('Erreur de connexion', error.message || 'Impossible de se connecter au serveur');
      } finally {
        isLoading.value = false;
      }
    };

    return {
      email,
      isLoading,
      requestPasswordReset,
    };
  },
});
</script>
