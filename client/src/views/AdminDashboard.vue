<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <button @click="showAddUserForm = true">Add User</button>

    <div v-if="showAddUserForm">
      <h2>Add User</h2>
      <form @submit.prevent="addUser">
        <input v-model="newUser.firstName" placeholder="First Name" required>
        <input v-model="newUser.lastName" placeholder="Last Name" required>
        <input v-model="newUser.email" placeholder="Email" required>
        <input v-model="newUser.password" type="password" placeholder="Password" required>
        <input v-model="newUser.shippingAddress" placeholder="Shipping Address" required>
        <select v-model="newUser.role">
          <option value="ROLE_USER">User</option>
          <option value="ROLE_STORE_KEEPER">Store Keeper</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>
        <button type="submit">Add User</button>
      </form>
    </div>

    <div v-if="editUserForm">
      <h2>Edit User</h2>
      <form @submit.prevent="updateUser(editUserForm.id)">
        <input v-model="editUserForm.firstName" placeholder="First Name" required>
        <input v-model="editUserForm.lastName" placeholder="Last Name" required>
        <input v-model="editUserForm.email" placeholder="Email" required>
        <input v-model="editUserForm.password" type="password" placeholder="Password">
        <input v-model="editUserForm.shippingAddress" placeholder="Shipping Address" required>
        <select v-model="editUserForm.role">
          <option value="ROLE_USER">User</option>
          <option value="ROLE_STORE_KEEPER">Store Keeper</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>
        <button type="submit">Update User</button>
      </form>
    </div>

    <div v-if="message" class="message">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>

    <h2>Users List</h2>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.firstName }} {{ user.lastName }} - {{ user.email }}
        <button @click="editUser(user)">Edit</button>
        <button @click="deleteUser(user.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchUsers, createUser as createNewUser, updateUser as updateExistingUser, deleteUser as deleteExistingUser } from '../services/userService';

export default defineComponent({
  name: 'AdminDashboard',
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

    const deleteUser = async (id) => {
      try {
        await deleteExistingUser(id);
        loadUsers();
        message.value = 'User deleted successfully';
      } catch (err) {
        error.value = 'Error deleting user';
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
      deleteUser,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
