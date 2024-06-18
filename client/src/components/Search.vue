<!-- client/src/components/Search.vue -->
<template>
  <div class="search">
    <h1>Search Products</h1>
    <form @submit.prevent="searchProducts">
      <div>
        <label for="name">Name:</label>
        <input type="text" v-model="filters.name" />
      </div>
      <div>
        <label for="description">Description:</label>
        <input type="text" v-model="filters.description" />
      </div>
      <div>
        <label for="category">Category:</label>
        <input type="text" v-model="filters.category" />
      </div>
      <div>
        <label for="brand">Brand:</label>
        <input type="text" v-model="filters.brand" />
      </div>
      <div>
        <label for="minPrice">Min Price:</label>
        <input type="number" v-model="filters.minPrice" />
      </div>
      <div>
        <label for="maxPrice">Max Price:</label>
        <input type="number" v-model="filters.maxPrice" />
      </div>
      <div>
        <label for="onSale">On Sale:</label>
        <input type="checkbox" v-model="filters.onSale" />
      </div>
      <div>
        <label for="inStock">In Stock:</label>
        <input type="checkbox" v-model="filters.inStock" />
      </div>
      <button type="submit">Search</button>
    </form>
    <ProductList :products="products" />
  </div>
</template>

<script>
import ProductList from './ProductList.vue';

export default {
  components: { ProductList },
  data() {
    return {
      filters: {
        name: '',
        description: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        onSale: false,
        inStock: false
      },
      products: []
    };
  },
  methods: {
    async searchProducts() {
      const params = new URLSearchParams(this.filters).toString();
      const response = await fetch(`http://localhost:8000/api/products?${params}`);
      this.products = await response.json();
    }
  }
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
