<template>
    <div class="forgot-password">
      <h1>Forgot Password</h1>
      <form @submit.prevent="requestPasswordReset">
        <div>
          <label for="email">Email:</label>
          <input type="email" v-model="email" required />
        </div>
        <button type="submit">Request Password Reset</button>
      </form>
      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
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
            message.value = 'Password reset email sent. Please check your email.';
            error.value = '';
          } else {
            error.value = data.errors ? data.errors.map(err => err.msg).join(', ') : `Request failed: ${data.message}`;
            message.value = '';
          }
        } catch (err) {
          error.value = `Request failed: ${err.message}`;
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
  
  <style scoped>
  .message {
    color: green;
  }
  .error {
    color: red;
  }
  </style>
  