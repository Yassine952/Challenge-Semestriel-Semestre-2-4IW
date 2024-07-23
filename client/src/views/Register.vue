<template>
  <div class="register">
    <h1>Register</h1>
    <form @submit.prevent="register">
      <div>
        <label for="firstName">First Name:</label>
        <input type="text" v-model="firstName" required />
      </div>
      <div>
        <label for="lastName">Last Name:</label>
        <input type="text" v-model="lastName" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <div>
        <label for="shippingAddress">Shipping Address:</label>
        <input type="text" v-model="shippingAddress" required />
      </div>
      <div>
        <input type="checkbox" v-model="acceptTerms" id="acceptTerms" required />
        <label for="acceptTerms">I accept the <router-link to="/privacy-policy">privacy policy</router-link> and <router-link to="/mentions-legales">terms and conditions</router-link>.</label>
      </div>
      <button type="submit" :disabled="!acceptTerms">Register</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Register',
  setup() {
    const firstName = ref('');
    const lastName = ref('');
    const email = ref('');
    const password = ref('');
    const shippingAddress = ref('');
    const acceptTerms = ref(false);
    const error = ref('');
    const router = useRouter();

    const register = async () => {
      // Validation du mot de passe côté frontend
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
      if (!passwordRegex.test(password.value)) {
        error.value = 'Password must be at least 12 characters long and include a mix of letters, numbers, and symbols.';
        return;
      }

      if (!acceptTerms.value) {
        error.value = 'You must accept the privacy policy and terms and conditions.';
        return;
      }

      try {
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
        const data = await response.json();
        if (response.ok) {
          alert('Registration successful! Please check your email to confirm your account.');
          // Dispatch a custom event to notify about the login status change
          window.dispatchEvent(new CustomEvent('loginStatusChanged'));
          router.push('/login');
        } else {
          error.value = `Registration failed: ${data.errors ? data.errors[0].msg : data.message}`;
        }
      } catch (err) {
        error.value = `Registration failed: ${err.message}`;
      }
    };

    return {
      firstName,
      lastName,
      email,
      password,
      shippingAddress,
      acceptTerms,
      error,
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
