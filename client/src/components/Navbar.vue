<template>
  <nav>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li v-if="!isLoggedIn"><router-link to="/login">Login</router-link></li>
      <li v-if="!isLoggedIn"><router-link to="/register">Register</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/search">Search</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/admin">Admin Panel</router-link></li>
      <li v-if="isLoggedIn"><button @click="logout">Logout</button></li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Navbar',
  setup() {
    const router = useRouter();
    const isLoggedIn = ref(!!localStorage.getItem('token'));

    const logout = () => {
      localStorage.removeItem('token');
      isLoggedIn.value = false;
      router.push('/login');
    };

    const checkLoginStatus = () => {
      isLoggedIn.value = !!localStorage.getItem('token');
    };

    // Listen for the custom login/logout event
    onMounted(() => {
      window.addEventListener('loginStatusChanged', checkLoginStatus);
    });

    return { isLoggedIn, logout };
  },
});
</script>

<style scoped>
nav ul {
  list-style-type: none;
  padding: 0;
}
nav li {
  display: inline;
  margin-right: 10px;
}
</style>
