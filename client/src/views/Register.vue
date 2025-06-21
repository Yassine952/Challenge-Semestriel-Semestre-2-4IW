<template>
  <main class="w-full h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
    <div class="w-full space-y-6 text-gray-600 sm:max-w-md">
      <div class="text-center">
        <div class="mt-5 space-y-2">
          <h3 class="text-gray-800 text-2xl font-bold sm:text-3xl">
            S'inscrire
          </h3>
          <p>
            Vous avez déjà un compte ?
            <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Connectez-vous
            </router-link>
          </p>
        </div>
      </div>
      <div class="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
        <form @submit.prevent="register" class="space-y-5">
          <div>
            <label for="firstName" class="font-medium">Prénom</label>
            <input
              type="text"
              v-model="firstName"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label for="lastName" class="font-medium">Nom de famille</label>
            <input
              type="text"
              v-model="lastName"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label for="email" class="font-medium">Email</label>
            <input
              type="email"
              v-model="email"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label for="password" class="font-medium">Mot de passe</label>
            <input
              type="password"
              v-model="password"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label for="shippingAddress" class="font-medium">Adresse de livraison</label>
            <input
              type="text"
              v-model="shippingAddress"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <input
              type="checkbox"
              v-model="acceptTerms"
              id="acceptTerms"
              required
            />
            <label for="acceptTerms">
              J'accepte la
              <router-link to="/privacy-policy" class="text-indigo-600 hover:text-indigo-500">
                politique de confidentialité
              </router-link>
              et
              <router-link to="/legal-mentions" class="text-indigo-600 hover:text-indigo-500">
                les conditions générales de vente
              </router-link>.
            </label>
          </div>
          <button
            type="submit"
            :disabled="!acceptTerms"
            class="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
          >
            S'inscrire
          </button>
        </form>

      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifications } from '../composables/useNotifications';

export default defineComponent({
  name: 'Register',
  setup() {
    const { addNotification } = useNotifications();
    const firstName = ref('');
    const lastName = ref('');
    const email = ref('');
    const password = ref('');
    const shippingAddress = ref('');
    const acceptTerms = ref(false);
    const router = useRouter();

    const register = async () => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
      if (!passwordRegex.test(password.value)) {
        addNotification('Le mot de passe doit comporter au moins 12 caractères et inclure un mélange de lettres, de chiffres et de symboles.', 'error');
        return;
      }

      if (!acceptTerms.value) {
        addNotification('Vous devez accepter la politique de confidentialité et les conditions générales de vente.', 'error');
        return;
      }

      try {
        console.log('Envoi de la requête d\'inscription...');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: firstName.value,
            lastName: lastName.value,
            email: email.value,
            password: password.value,
            shippingAddress: shippingAddress.value
          }),
        });

        console.log('Réponse reçue:', response);
        const data = await response.json();
        console.log('Données reçues:', data);

        if (response.ok) {
          addNotification('Inscription réussie ! Vous allez recevoir un mail pour confirmer votre compte.', 'success');
          window.dispatchEvent(new CustomEvent('loginStatusChanged'));
          router.push('/login');
        } else {
          addNotification(`L'inscription a échoué : ${data.errors ? data.errors[0].msg : data.message}`, 'error');
        }
      } catch (err) {
        console.error('Erreur lors de l\'inscription:', err);
        addNotification(`L'inscription a échoué : ${err.message}`, 'error');
      }
    };

    return {
      firstName,
      lastName,
      email,
      password,
      shippingAddress,
      acceptTerms,
      register,
    };
  },
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
