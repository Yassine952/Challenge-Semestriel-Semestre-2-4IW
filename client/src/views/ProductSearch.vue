<template>
  <div>
    <h1>Recherche de produits</h1>
    <form @submit.prevent="performSearch">
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
        <select v-model="searchCriteria.category">
          <option value="">Toutes les catégories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
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
import { defineComponent, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchProducts, fetchCategories } from '../services/productService';
import { Product } from '../types/Product';

export default defineComponent({
  name: 'ProductSearch',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const products = ref<Product[]>([]);
    const categories = ref<string[]>([]);
    const searchCriteria = ref({
      name: route.query.q || '',
      description: route.query.description || '',
      category: route.query.category || '',
      priceMin: route.query.priceMin ? Number(route.query.priceMin) : 0,
      priceMax: route.query.priceMax ? Number(route.query.priceMax) : 0,
      inStock: route.query.inStock === 'true',
    });

    const loadCategories = async () => {
      try {
        categories.value = await fetchCategories();
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const performSearch = async () => {
      const query: any = { ...searchCriteria.value };

      // Convert the boolean to a string for the query parameters
      query.inStock = searchCriteria.value.inStock ? 'true' : 'false';

      // Remove unnecessary parameters
      if (!query.name) delete query.name;
      if (!query.description) delete query.description;
      if (!query.category) delete query.category;
      if (!query.priceMin) delete query.priceMin;
      if (!query.priceMax) delete query.priceMax;
      if (query.inStock === 'false') delete query.inStock;

      console.log('Performing search with criteria:', query);

      router.push({ name: 'ProductSearch', query });

      try {
        const response = await searchProducts(query);
        products.value = response;
      } catch (error) {
        console.error('Error searching products:', error);
      }
    };

    watch(route, () => {
      searchCriteria.value = {
        name: route.query.name || '',
        description: route.query.description || '',
        category: route.query.category || '',
        priceMin: route.query.priceMin ? Number(route.query.priceMin) : 0,
        priceMax: route.query.priceMax ? Number(route.query.priceMax) : 0,
        inStock: route.query.inStock === 'true',
      };
      performSearch();
    }, { immediate: true });

    onMounted(() => {
      loadCategories();
      performSearch();
    });

    return {
      searchCriteria,
      products,
      categories,
      performSearch,
    };
  },
});
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
