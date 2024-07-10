<template>
  <div class="user-list">
    <h1>Liste des utilisateurs</h1>
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.email }}</td>
          <td>
            <button @click="deleteUser(user.id)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { fetchUsers, deleteUser } from '../services/userService';
import { User } from '../types/User';

export default defineComponent({
  name: 'UserList',
  setup() {
    const users = ref<User[]>([]);

    const loadUsers = async () => {
      users.value = await fetchUsers();
    };

    const removeUser = async (id: number) => {
      await deleteUser(id);
      loadUsers();
    };

    onMounted(loadUsers);

    return {
      users,
      deleteUser: removeUser,
    };
  },
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}
</style>
