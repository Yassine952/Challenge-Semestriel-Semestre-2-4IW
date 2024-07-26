<template>
  <main class="w-full h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
    <div class="w-full space-y-6 text-gray-600 sm:max-w-md">
      <div class="text-center">
        <div class="mt-5 space-y-2">
          <h3 class="text-gray-800 text-2xl font-bold sm:text-3xl">
            Réinitialiser le mot de passe
          </h3>
        </div>
      </div>
      <div class="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
        <form @submit.prevent="resetPassword" class="space-y-5">
          <div>
            <label for="newPassword" class="font-medium">Nouveau mot de passe</label>
            <input
              type="password"
              v-model="newPassword"
              required
              class="w-full px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <button
            type="submit"
            class="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
          >
            Réinitialiser le mot de passe
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
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'ResetPassword',
  setup() {
    const route = useRoute();
    const newPassword = ref('');
    const message = ref('');
    const error = ref('');

    const resetPassword = async () => {
      const token = route.params.token;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newPassword: newPassword.value }),
        });

        if (response.ok) {
          message.value = 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.';
          error.value = '';
        } else {
          error.value = `Le mot de passe doit comporter au moins 12 caractères et contenir des symboles, des chiffres, des lettres minuscules et majuscules.`;
          message.value = '';
        }
      } catch (err) {
        error.value = `La demande a échoué: ${err.message}`;
        message.value = '';
      }
    };

    return {
      newPassword,
      message,
      error,
      resetPassword,
    };
  },
});
</script>
