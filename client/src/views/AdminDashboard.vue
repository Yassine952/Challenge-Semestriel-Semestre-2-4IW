<template>
  <div class="admin-dashboard p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-4">Tableau de bord</h1>
    <button @click="showAddUserForm = true" class="bg-indigo-600 text-white px-4 py-2 rounded-md mb-4">
      Ajouter un utilisateur
    </button>
    <router-link to="/products" class="text-indigo-600 hover:underline">Gérer les produits</router-link>
    
    <div v-if="showAddUserForm" class="mt-6 p-6 bg-white shadow-md rounded-md">
      <h2 class="text-2xl font-semibold mb-4">Ajouter un utilisateur</h2>
      <form @submit.prevent="addUser" class="space-y-4">
        <input v-model="newUser.firstName" placeholder="Prénom" required class="w-full px-3 py-2 border rounded-md">
        <input v-model="newUser.lastName" placeholder="Nom de famille" required class="w-full px-3 py-2 border rounded-md">
        <input v-model="newUser.email" placeholder="Email" required class="w-full px-3 py-2 border rounded-md">
        <input v-model="newUser.password" type="password" placeholder="Mot de passe" required class="w-full px-3 py-2 border rounded-md">
        <input v-model="newUser.shippingAddress" placeholder="Adresse de livraison" required class="w-full px-3 py-2 border rounded-md">
        <select v-model="newUser.role" class="w-full px-3 py-2 border rounded-md">
          <option value="ROLE_USER">Utilisateur</option>
          <option value="ROLE_STORE_KEEPER">Store Keeper</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-md">Ajouter</button>
      </form>
    </div>

    <div v-if="editUserForm" class="mt-6 p-6 bg-white shadow-md rounded-md">
      <h2 class="text-2xl font-semibold mb-4">Modifier un utilisateur</h2>
      <form @submit.prevent="updateUser(editUserForm.userId)" class="space-y-4">
        <input v-model="editUserForm.firstName" placeholder="Prénom" required class="w-full px-3 py-2 border rounded-md">
        <input v-model="editUserForm.lastName" placeholder="Nom de famille" required class="w-full px-3 py-2 border rounded-md">
        <input v-model="editUserForm.email" placeholder="Email" required class="w-full px-3 py-2 border rounded-md">
        <input v-model="editUserForm.password" type="password" placeholder="Mot de passe" class="w-full px-3 py-2 border rounded-md">
        <input v-model="editUserForm.shippingAddress" placeholder="Adresse de livraison" required class="w-full px-3 py-2 border rounded-md">
        <select v-model="editUserForm.role" class="w-full px-3 py-2 border rounded-md">
          <option value="ROLE_USER">Utilisateur</option>
          <option value="ROLE_STORE_KEEPER">Store Keeper</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md">Modifier l'utilisateur</button>
      </form>
    </div>

    <div v-if="message" class="mt-4 p-2 bg-green-100 text-green-800 rounded-md">{{ message }}</div>
    <div v-if="error" class="mt-4 p-2 bg-red-100 text-red-800 rounded-md">{{ error }}</div>

    <h2 class="text-2xl font-semibold mt-8 mb-4">Liste des utilisateurs</h2>
    <ul class="space-y-4">
      <li v-for="user in users" :key="user.userId" class="p-4 bg-white shadow-md rounded-md flex justify-between items-center">
        <span>{{ user.firstName }} {{ user.lastName }} - {{ user.email }}</span>
        <div class="flex space-x-2">
          <button @click="editUser(user)" class="text-blue-600 hover:underline">Modifier</button>
          <confirm-button
            :delete-url="`/users/${user.userId}`"
            :on-success="loadUsers"
          />
        </div>
      </li>
    </ul>

    <h2 class="text-2xl font-semibold mt-8 mb-4">Liste des commandes</h2>
    <ul class="space-y-4">
      <li v-for="order in orders" :key="order.id" class="p-4 bg-white shadow-md rounded-md">
        <span>Commande #{{ order.id }} - {{ order.totalAmount }} € - {{ order.status }}</span>
        <button @click="downloadInvoice(order.id)" class="text-indigo-600 hover:underline">
          Télécharger la facture
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchUsers, createUser as createNewUser, updateUser as updateExistingUser, fetchAllOrders, downloadInvoice } from '../services/userService';
import ConfirmButton from '../components/ConfirmButton.vue';
import { User } from '../types/User';
import { Order } from '../types/Order';

export default defineComponent({
  name: 'AdminDashboard',
  components: { ConfirmButton },
  setup() {
    const users = ref<User[]>([]);
    const orders = ref<Order[]>([]);
    const newUser = ref<User>({
      userId: 0,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      shippingAddress: '',
      role: 'ROLE_USER',
    });
    const editUserForm = ref<User | null>(null);
    const showAddUserForm = ref(false);
    const message = ref('');
    const error = ref('');

    const loadUsers = async () => {
      try {
        users.value = await fetchUsers();
      } catch (err) {
        error.value = 'Error loading users';
      }
    };

    const loadOrders = async () => {
      try {
        orders.value = await fetchAllOrders();
      } catch (err) {
        error.value = 'Error loading orders';
      }
    };

    const addUser = async () => {
      try {
        await createNewUser(newUser.value);
        loadUsers();
        showAddUserForm.value = false;
        message.value = 'Utilisateur ajouté';
      } catch (err) {
        error.value = 'Erreur en ajoutant un utilisateur';
      }
    };

    const editUser = (user: User) => {
      editUserForm.value = { ...user, password: '' }; 
    };

    const updateUser = async (id: number) => {
      try {
        if (editUserForm.value) {
          await updateExistingUser(id, editUserForm.value);
          loadUsers();
          editUserForm.value = null;
          message.value = 'User updated successfully';
        }
      } catch (err) {
        error.value = 'Error updating user';
      }
    };

    onMounted(() => {
      loadUsers();
      loadOrders();
    });

    return {
      users,
      orders,
      newUser,
      editUserForm,
      showAddUserForm,
      message,
      error,
      addUser,
      editUser,
      updateUser,
      loadUsers,
      loadOrders,
      downloadInvoice
    };
  },
});
</script>
