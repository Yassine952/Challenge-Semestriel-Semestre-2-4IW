<template>
  <div class="profile max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
    <h1 class="text-2xl font-semibold mb-6">Profil</h1>
    <form @submit.prevent="updateProfile" class="space-y-4">
      <div>
        <label for="firstName" class="block text-sm font-medium text-gray-700">Prénom:</label>
        <input type="text" v-model="user.firstName" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
      </div>
      <div>
        <label for="lastName" class="block text-sm font-medium text-gray-700">Nom de famille:</label>
        <input type="text" v-model="user.lastName" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
      </div>
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email:</label>
        <input type="email" v-model="user.email" readonly class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"/>
      </div>
      <div>
        <label for="shippingAddress" class="block text-sm font-medium text-gray-700">Adresse de livraison:</label>
        <input type="text" v-model="user.shippingAddress" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
      </div>
      <button type="submit" class="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-500">
        Mettre à jour votre profil
      </button>
    </form>
    <p v-if="error" class="error mt-4 text-red-500">{{ error }}</p>

    <h2 class="text-xl font-semibold mt-8 mb-4">Mes Commandes</h2>
    <ul v-if="orders.length > 0" class="space-y-4">
      <li v-for="order in orders" :key="order.id" class="p-4 border border-gray-300 rounded-md shadow-sm">
        <div class="flex justify-between items-center">
          <span>Commande #{{ order.id }} - {{ order.totalAmount }} € - {{ order.status }}</span>
          <button @click="downloadInvoice(order.id)" class="text-indigo-600 hover:underline">
            Télécharger la facture
          </button>
        </div>
      </li>
    </ul>
    <p v-else class="mt-4 text-gray-600">Aucune commande trouvée.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue';
import axios from 'axios';
import { fetchUserProfile, fetchUserOrders, downloadInvoice } from '../services/userService';
import { User } from '../types/User';
import { Order } from '../types/Order';

export default defineComponent({
  name: 'Profile',
  setup() {
    const user = reactive<User>({
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      shippingAddress: ''
    });
    const orders = ref<Order[]>([]);

    const error = ref<string>('');

    const fetchProfile = async () => {
      try {
        const response = await fetchUserProfile();
        Object.assign(user, response);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        if (err instanceof Error) {
          error.value = `Failed to fetch profile: ${err.message}`;
        } else {
          error.value = 'Failed to fetch profile';
        }
      }
    };

    const fetchOrders = async () => {
      try {
        orders.value = await fetchUserOrders();
      } catch (err) {
        console.error('Failed to fetch orders', err);
        if (err instanceof Error) {
          error.value = `Failed to fetch orders: ${err.message}`;
        } else {
          error.value = 'Failed to fetch orders';
        }
      }
    };

    const updateProfile = async () => {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/profile`, user, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('Profile updated successfully');
      } catch (err) {
        console.error('Failed to update profile', err);
        if (err instanceof Error) {
          error.value = `Failed to update profile: ${err.message}`;
        } else {
          error.value = 'Failed to update profile';
        }
      }
    };

    onMounted(() => {
      fetchProfile();
      fetchOrders();
    });

    return { user, orders, error, updateProfile, downloadInvoice };
  }
});
</script>
