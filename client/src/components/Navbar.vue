<template>
  <nav>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li v-if="!isLoggedIn"><router-link to="/login">Login</router-link></li>
      <li v-if="!isLoggedIn"><router-link to="/register">Register</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/products">Products</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/add-product">Add Product</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/users">Users</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/admin">Admin Panel</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/cart">Cart</router-link></li>
      <li v-if="isLoggedIn"><button @click="logout">Logout</button></li>
    </ul>
    <div v-if="isLoggedIn" class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Search products..." @keypress.enter="performSearch" />
      <button @click="performSearch">Search</button>
    </div>
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
    const searchQuery = ref('');

    const logout = () => {
      localStorage.removeItem('token');
      isLoggedIn.value = false;
      router.push('/login');
    };

    const checkLoginStatus = () => {
      isLoggedIn.value = !!localStorage.getItem('token');
    };

    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({ name: 'ProductSearch', query: { name: searchQuery.value.trim() } });
      }
    };

    onMounted(() => {
      window.addEventListener('loginStatusChanged', checkLoginStatus);
    });

    return { isLoggedIn, logout, searchQuery, performSearch };
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
.search-container {
  display: inline-block;
  margin-left: 20px;
}
.search-container input {
  padding: 5px;
}
.search-container button {
  padding: 5px 10px;
}
</style>
