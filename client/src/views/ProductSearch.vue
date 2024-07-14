<template>
  <div>
    <input type="text" v-model="searchTerm" placeholder="Search products..." />
    <button @click="searchProducts">Search</button>

    <h1>Recherche de produits</h1>
    <form @submit.prevent="searchProducts">
      <div>
        <label for="name">Nom:</label>
        <input type="text" v-model="searchCriteria.name" />
      </div>
      <div>
        <label for="description">Description:</label>
        <input type="text" v-model="searchCriteria.description" />
      </div>
      <div>
        <label for="category">Catégorie:</label>
        <input type="text" v-model="searchCriteria.category" />
      </div>
      <div>
        <label for="priceMin">Prix minimum:</label>
        <input type="number" v-model.number="searchCriteria.priceMin" />
      </div>
      <div>
        <label for="priceMax">Prix maximum:</label>
        <input type="number" v-model.number="searchCriteria.priceMax" />
      </div>
      <div>
        <label for="inStock">En stock:</label>
        <input type="checkbox" v-model="searchCriteria.inStock" />
      </div>
      <button type="submit">Rechercher</button>
    </form>

    <div v-if="products.length === 0">
      Aucun produit trouvé.
    </div>
    <ul v-else>
      <li v-for="product in products" :key="product.id">
        {{ product.name }} - {{ product.description }} - {{ product.price }} - {{ product.stock }} en stock
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { searchProducts } from '../services/productService';
import { Product } from '../types/Product';

export default defineComponent({
  name: 'ProductSearch',
  setup() {
    const searchTerm = ref('');
    const searchCriteria = ref({
      name: '',
      description: '',
      category: '',
      priceMin: 0,
      priceMax: 0,
      inStock: false,
    });
    const products = ref<Product[]>([]);

    const performSearch = async () => {
      try {
        const response = await searchProducts(searchCriteria.value);
        console.log('Search response:', response);
        products.value = response;
      } catch (error) {
        console.error('Error searching products:', error);
      }
    };

    return {
      searchTerm,
      searchCriteria,
      products,
      searchProducts: performSearch,
    };
  },
});
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
