<template>
  <footer class="py-6">
    <div class="container mx-auto px-4">
      <div class="flex justify-center space-x-6 mb-4">
        <router-link to="/legal-mentions" class="hover:text-indigo-600">Mentions Légales</router-link>
        <router-link to="/privacy-policy" class="hover:text-indigo-600">Politique de Confidentialité</router-link>
        <router-link to="/terms-and-conditions" class="hover:text-indigo-600">Conditions Générales de Vente</router-link>
      </div>
      <div class="text-center">
        <p>&copy; 2024 Lemondedesmugs.fr Tous droits réservés.</p>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Footer',
});
</script>

<style scoped>
.svg-icon path,
.svg-icon polygon,
.svg-icon rect {
  fill: currentColor;
}
</style>
