<template>
  <div class="login">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

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
          // Dispatch a custom event to notify about the login status change
          window.dispatchEvent(new CustomEvent('loginStatusChanged'));
          router.push('/');
        } else {
          error.value = `Login failed: ${data.message}`;
        }
      } catch (err) {
        error.value = `Login failed: ${err.message}`;
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

<style scoped>
.error {
  color: red;
}
</style>
