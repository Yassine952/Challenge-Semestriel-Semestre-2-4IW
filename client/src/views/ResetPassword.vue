<template>
    <div class="reset-password">
      <h1>Reset Password</h1>
      <form @submit.prevent="resetPassword">
        <div>
          <label for="newPassword">New Password:</label>
          <input type="password" v-model="newPassword" required />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
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
            message.value = 'Password reset successfully. You can now login with your new password.';
            error.value = '';
          } else {
            error.value = `Le mot de passe doit comporter au moins 12 caractères et contenir des symboles, des chiffres, des lettres minuscules et majuscules.`;
            message.value = '';
          }
        } catch (err) {
          error.value = `Request failed: ${err.message}`;
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
  
  <style scoped>
  .message {
    color: green;
  }
  .error {
    color: red;
  }
  </style>
  