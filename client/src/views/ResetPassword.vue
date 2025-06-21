<template>
  <!-- 🔐 Page Reset Password - Design Aurora -->
  <main class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- En-tête -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2-2m2 2H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Nouveau mot de passe</h1>
        <p class="text-gray-600">Choisissez un mot de passe sécurisé pour votre compte</p>
      </div>

      <!-- Formulaire -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
        <form @submit.prevent="resetPassword" class="space-y-6">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              type="password"
              v-model="newPassword"
              required
              placeholder="Entrez votre nouveau mot de passe"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/80 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
            />
            <p class="text-xs text-gray-500 mt-2">
              Minimum 12 caractères avec majuscules, minuscules, chiffres et symboles
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              v-model="confirmPassword"
              required
              placeholder="Confirmez votre nouveau mot de passe"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/80 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
            />
          </div>

          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span>{{ loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}</span>
          </button>
        </form>



        <!-- Lien retour -->
        <div class="text-center mt-8">
          <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
            ← Retour à la connexion
          </router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotifications } from '../composables/useNotifications';

export default defineComponent({
  name: 'ResetPassword',
  setup() {
    const { addNotification } = useNotifications();
    const route = useRoute();
    const router = useRouter();
    const newPassword = ref('');
    const confirmPassword = ref('');
    const loading = ref(false);

    // Validation du formulaire
    const isFormValid = computed(() => {
      return newPassword.value.length >= 12 && 
             newPassword.value === confirmPassword.value &&
             /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(newPassword.value);
    });

    const resetPassword = async () => {
      if (!isFormValid.value) {
        addNotification('Veuillez vérifier que les mots de passe correspondent et respectent les critères de sécurité.', 'error');
        return;
      }

      loading.value = true;

      const token = route.params.token;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newPassword: newPassword.value }),
        });

        const data = await response.json();

        if (response.ok) {
          addNotification('Mot de passe réinitialisé avec succès ! Redirection vers la page de connexion...', 'success');
          
          // Redirection après 3 secondes
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          addNotification(data.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.', 'error');
        }
      } catch (err: any) {
        addNotification(`Erreur de connexion: ${err.message}`, 'error');
      } finally {
        loading.value = false;
      }
    };

    return {
      newPassword,
      confirmPassword,
      loading,
      isFormValid,
      resetPassword,
    };
  },
});
</script>
