<template>
  <div class="admin-panel">
    <h1>Panneau Admin</h1>
    <router-link to="/products">Gestion des produits</router-link>
    <router-link to="/users">Gestion des utilisateurs</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AdminPanel',
});
</script>

<style scoped>
.admin-panel {
  display: flex;
  flex-direction: column;
}

.router-link {
  margin: 10px 0;
}
</style>
