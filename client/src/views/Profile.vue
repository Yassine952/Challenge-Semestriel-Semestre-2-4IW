<template>
  <div class="profile">
    <h1>Profile</h1>
    <form @submit.prevent="updateProfile">
      <div>
        <label for="firstName">First Name:</label>
        <input type="text" v-model="user.firstName" required />
      </div>
      <div>
        <label for="lastName">Last Name:</label>
        <input type="text" v-model="user.lastName" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="user.email" readonly />
      </div>
      <div>
        <label for="shippingAddress">Shipping Address:</label>
        <input type="text" v-model="user.shippingAddress" required />
      </div>
      <button type="submit">Update Profile</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>

    <h2>Mes Commandes</h2>
    <ul v-if="orders.length > 0">
      <li v-for="order in orders" :key="order.id">
        Commande #{{ order.id }} - {{ order.totalAmount }} € - {{ order.status }}
        <button @click="downloadInvoice(order.id)">Télécharger la facture</button>
      </li>
    </ul>
    <p v-else>Aucune commande trouvée.</p>


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

<style scoped>
.error {
  color: red;
}
form {
  display: flex;
  flex-direction: column;
}
form div {
  margin-bottom: 10px;
}
label {
  margin-right: 10px;
}
button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
</style>
