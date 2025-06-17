<template>
  <nav class="bg-white border-b">
    <div class="flex items-center space-x-8 py-3 px-4 max-w-screen-xl mx-auto md:px-8">
      <div class="flex-none lg:flex-initial">
      
      </div>
      <div class="flex-1 flex items-center justify-between">
        <div
          class="bg-white absolute z-20 w-full top-16 left-0 p-4 border-b lg:static lg:block lg:border-none"
          :class="{ hidden: !menuState }"
        >
          <ul class="mt-12 space-y-5 lg:flex lg:space-x-6 lg:space-y-0 lg:mt-0">
            <li class="text-gray-600 hover:text-gray-900"><router-link to="/">Home</router-link></li>
            <li v-if="!isLoggedIn" class="text-gray-600 hover:text-gray-900"><router-link to="/login">Se connecter</router-link></li>
            <li v-if="!isLoggedIn" class="text-gray-600 hover:text-gray-900"><router-link to="/register">S'inscrire</router-link></li>
            <li v-if="isLoggedIn && (hasRole('ROLE_STORE_KEEPER') || hasRole('ROLE_ADMIN'))" class="text-gray-600 hover:text-gray-900">
              <router-link to="/products">Produits</router-link>
            </li>
            <li v-if="isLoggedIn && (hasRole('ROLE_STORE_KEEPER') || hasRole('ROLE_ADMIN'))" class="text-gray-600 hover:text-gray-900">
              <router-link to="/add-product">Ajouter un produit</router-link>
            </li>
            <li v-if="isLoggedIn && hasRole('ROLE_ADMIN')" class="text-gray-600 hover:text-gray-900">
              <router-link to="/admin-dashboard">Tableau de bord</router-link>
            </li>
            <li v-if="isLoggedIn" class="text-gray-600 hover:text-gray-900"><router-link to="/cart">Panier</router-link></li>
            <li v-if="isLoggedIn" class="text-gray-600 hover:text-gray-900"><router-link to="/profile">Profil</router-link></li>
            <li v-if="isLoggedIn" class="text-gray-600 hover:text-gray-900">
              <button @click="logout">Se déconnecter</button>
            </li>
          </ul>
          <ProfileDropDown class="mt-5 pt-5 border-t lg:hidden" />
        </div>
        <div class="flex-1 flex items-center justify-end space-x-2 sm:space-x-6">
          <form class="flex items-center space-x-2 border rounded-md p-2" @submit.prevent="performSearch">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-none text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              class="w-full outline-none appearance-none placeholder-gray-500 text-gray-500 sm:w-auto"
              type="text"
              v-model="searchQuery"
              placeholder="Chercher un produit..."
              @keypress.enter="performSearch"
            />
          </form>
          <ProfileDropDown class="hidden lg:block" />
          <button class="outline-none text-gray-400 block lg:hidden" @click="toggleMenu">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="menuState" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
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
    const menuState = ref<boolean>(false);

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
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

    const toggleMenu = () => {
      menuState.value = !menuState.value;
    };

    onMounted(() => {
      checkLoginStatus();
      window.addEventListener('loginStatusChanged', checkLoginStatus);
    });

    return { isLoggedIn, logout, searchQuery, performSearch, hasRole, menuState, toggleMenu };
  },
});
</script>

<style scoped>
</style>
