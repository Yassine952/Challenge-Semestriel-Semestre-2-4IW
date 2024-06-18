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
      async login() {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
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
            alert('Login successful!');
            // Save token to localStorage or state management
            localStorage.setItem('token', data.token);
          } else {
            alert(`Login failed: ${data.message}`);
          }
        } catch (error) {
          alert(`Login failed: ${error.message}`);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* Ajoutez vos styles ici */
  </style>
  