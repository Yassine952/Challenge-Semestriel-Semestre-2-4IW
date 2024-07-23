<template>
  <div class="admin-dashboard">
    <h1>Tableau de bord </h1>
    <button @click="showAddUserForm = true">Ajouter un utilisateur</button>
    <router-link to="/products">Gérer les produits</router-link>
    <div v-if="showAddUserForm">
      <h2>Ajouter un utilisateur</h2>
      <form @submit.prevent="addUser">
        <input v-model="newUser.firstName" placeholder="Prénom" required>
        <input v-model="newUser.lastName" placeholder="Nom de famille" required>
        <input v-model="newUser.email" placeholder="Email" required>
        <input v-model="newUser.password" type="password" placeholder="Mot de passe" required>
        <input v-model="newUser.shippingAddress" placeholder="Adresse de livraison" required>
        <select v-model="newUser.role">
          <option value="ROLE_USER">User</option>
          <option value="ROLE_STORE_KEEPER">Store Keeper</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>
        <button type="submit">Ajouter</button>
      </form>
    </div>

    <div v-if="editUserForm">
      <h2>Modifier un utilisateur</h2>
      <form @submit.prevent="updateUser(editUserForm.id)">
        <input v-model="editUserForm.firstName" placeholder="Prénom" required>
        <input v-model="editUserForm.lastName" placeholder="Nom de famille" required>
        <input v-model="editUserForm.email" placeholder="Email" required>
        <input v-model="editUserForm.password" type="password" placeholder="Mot de passe">
        <input v-model="editUserForm.shippingAddress" placeholder="Adresse de livraison" required>
        <select v-model="editUserForm.role">
          <option value="ROLE_USER">Utilisateur</option>
          <option value="ROLE_STORE_KEEPER">Store Keeper</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>
        <button type="submit">Modifier l'utilisateur</button>
      </form>
    </div>

    <div v-if="message" class="message">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>

    <h2>Liste des utilisateurs</h2>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.firstName }} {{ user.lastName }} - {{ user.email }}
        <button @click="editUser(user)">Modifier</button>
        <confirm-button
          :delete-url="`/api/users/${user.id}`"
          :on-success="loadUsers"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchUsers, createUser as createNewUser, updateUser as updateExistingUser } from '../services/userService';
import ConfirmButton from '../components/ConfirmButton.vue';

export default defineComponent({
  name: 'AdminDashboard',
  components: { ConfirmButton },
  setup() {
    const users = ref([]);
    const newUser = ref({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      shippingAddress: '',
      role: 'ROLE_USER',
    });
    const editUserForm = ref(null);
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

    const addUser = async () => {
      try {
        await createNewUser(newUser.value);
        loadUsers();
        showAddUserForm.value = false;
        message.value = 'User added successfully';
      } catch (err) {
        error.value = 'Error adding user';
      }
    };

    const editUser = (user) => {
      editUserForm.value = { ...user, password: '' }; // Clear password field for security
    };

    const updateUser = async (id) => {
      try {
        await updateExistingUser(id, editUserForm.value);
        loadUsers();
        editUserForm.value = null;
        message.value = 'User updated successfully';
      } catch (err) {
        error.value = 'Error updating user';
      }
    };

    onMounted(loadUsers);

    return {
      users,
      newUser,
      editUserForm,
      showAddUserForm,
      message,
      error,
      addUser,
      editUser,
      updateUser,
      loadUsers,
    };
  },
});
</script>

<style scoped>
.product-link {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #007bff;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
}
.product-link:hover {
  background-color: #0056b3;
}
</style>
