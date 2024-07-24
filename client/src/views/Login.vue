<template>
  <main class="w-full h-screen flex flex-col items-center justify-center px-4">
    <div class="max-w-sm w-full text-gray-600">
      <div class="text-center">
        <div class="mt-5 space-y-2">
          <h3 class="text-gray-800 text-2xl font-bold sm:text-3xl">Se connecter</h3>
          <p class="">
            Vous n'avez pas de compte ?
            <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
              Inscrivez-vous
            </router-link>
          </p>
        </div>
      </div>
      <form @submit.prevent="login" class="mt-8 space-y-5">
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
        <button
          type="submit"
          class="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
        >
          Se connecter
        </button>
        <div class="text-center">
          <router-link to="/forgot-password" class="hover:text-indigo-600">
            Mot de passe oublié ?
          </router-link>
        </div>
      </form>
      <p v-if="error" class="error mt-4 text-red-500 text-center">{{ error }}</p>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

export default defineComponent({
  name: 'Login',
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref('');
    const router = useRouter();

    const login = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          const decodedToken = jwtDecode<{ role: string }>(data.token);
          localStorage.setItem('role', decodedToken.role);
          window.dispatchEvent(new CustomEvent('loginStatusChanged'));
          router.push('/');
        } else {
          error.value = `Échec de la connexion : ${data.message}`;
        }
      } catch (err) {
        error.value = `Échec de la connexion : ${err.message}`;
      }
    };

    return {
      email,
      password,
      error,
      login,
    };
  },
});
</script>

