<template>
  <nav>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li v-if="!isLoggedIn"><router-link to="/login">Se connecter</router-link></li>
      <li v-if="!isLoggedIn"><router-link to="/register">S'inscrire</router-link></li>
      <li v-if="isLoggedIn && hasRole('ROLE_STORE_KEEPER') || hasRole('ROLE_ADMIN')"><router-link to="/products">Produits</router-link></li>
      <li v-if="isLoggedIn && hasRole('ROLE_STORE_KEEPER') || hasRole('ROLE_ADMIN')"><router-link to="/add-product">Ajouter un produit</router-link></li>
      <li v-if="isLoggedIn && hasRole('ROLE_ADMIN')"><router-link to="/admin-dashboard">Tableau de bord</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/cart">Panier</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/profile">Profil</router-link></li>
      <li v-if="isLoggedIn"><button @click="logout">Se déconnecter</button></li>
    </ul>
    <div class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Chercher un produit..." @keypress.enter="performSearch" />
      <button @click="performSearch">Chercher</button>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role: string;
}

export default defineComponent({
  name: 'Navbar',
  setup() {
    const router = useRouter();
    const isLoggedIn = ref<boolean>(!!localStorage.getItem('token'));
    const roles = ref<string[]>([]);
    const searchQuery = ref<string>('');

    const logout = () => {
      localStorage.removeItem('token');
      isLoggedIn.value = false;
      roles.value = [];
      router.push('/login');
    };

    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      isLoggedIn.value = !!token;
      if (token) {
        const decoded: DecodedToken = jwtDecode(token);
        roles.value = [decoded.role];
      } else {
        roles.value = [];
      }
    };

    const hasRole = (role: string) => {
      return roles.value.includes(role);
    };

    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({ name: 'ProductSearch', query: { description: searchQuery.value.trim() } });
      }
    };

    onMounted(() => {
      checkLoginStatus();
      window.addEventListener('loginStatusChanged', checkLoginStatus);
    });

    return { isLoggedIn, logout, searchQuery, performSearch, hasRole };
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
