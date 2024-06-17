<template>
    <div class="register">
      <h1>Register</h1>
      <form @submit.prevent="register">
        <div>
          <label for="email">Email:</label>
          <input type="email" v-model="email" required />
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      async register() {
        console.log('API URL:', import.meta.env.VITE_API_URL);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password
            })
          });
          const data = await response.json();
          if (response.ok) {
            alert('Registration successful! Please check your email to confirm your account.');
          } else {
            alert(`Registration failed: ${data.errors ? data.errors[0].msg : data.message}`);
          }
        } catch (error) {
          alert(`Registration failed: ${error.message}`);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* Ajoutez vos styles ici */
  </style>
  