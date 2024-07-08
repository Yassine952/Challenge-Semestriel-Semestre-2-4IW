<template>
  <div class="search">
    <h1>Search Products</h1>
    <form @submit.prevent="searchProducts">
      <div>
        <label for="name">Name:</label>
        <input type="text" v-model="filters.name" />
        <span v-if="errors.name">{{ errors.name }}</span>
      </div>
      <div>
        <label for="description">Description:</label>
        <input type="text" v-model="filters.description" />
        <span v-if="errors.description">{{ errors.description }}</span>
      </div>
      <div>
        <label for="category">Category:</label>
        <input type="text" v-model="filters.category" />
        <span v-if="errors.category">{{ errors.category }}</span>
      </div>
      <div>
        <label for="brand">Brand:</label>
        <input type="text" v-model="filters.brand" />
        <span v-if="errors.brand">{{ errors.brand }}</span>
      </div>
      <div>
        <label for="minPrice">Min Price:</label>
        <input type="number" v-model="filters.minPrice" />
        <span v-if="errors.minPrice">{{ errors.minPrice }}</span>
      </div>
      <div>
        <label for="maxPrice">Max Price:</label>
        <input type="number" v-model="filters.maxPrice" />
        <span v-if="errors.maxPrice">{{ errors.maxPrice }}</span>
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
    <div v-if="errors.general" class="error">{{ errors.general }}</div>
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
      errors: {
        name: '',
        description: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        general: ''
      },
      products: []
    };
  },
  methods: {
    validateFilters() {
      let valid = true;
      this.errors = {
        name: '',
        description: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        general: ''
      };

      if (this.filters.minPrice < 0) {
        this.errors.minPrice = 'Le prix ne peut pas être négatif.';
        valid = false;
      }

      if (this.filters.maxPrice < 0) {
        this.errors.maxPrice = 'Le prix ne peut pas être négatif.';
        valid = false;
      }

      if (this.filters.minPrice && this.filters.maxPrice && this.filters.minPrice > this.filters.maxPrice) {
        this.errors.minPrice = 'Le prix minimum ne peut pas être supérieur au prix maximum.';
        valid = false;
      }

      return valid;
    },
    async searchProducts() {
      if (!this.validateFilters()) {
        this.errors.general = 'Veuillez corriger les erreurs dans le formulaire.';
        return;
      }

      const params = new URLSearchParams();
      for (const key in this.filters) {
        if (this.filters[key]) {
          params.append(key, this.filters[key]);
        }
      }

      if (params.toString() === '') {
        this.errors.general = 'Veuillez fournir au moins un critère de recherche.';
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/products/search?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Erreur lors de la recherche');
        this.products = await response.json();
      } catch (error) {
        this.errors.general = 'Failed to fetch: ' + error.message;
      }
    }
  }
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
.error {
  color: red;
  font-size: 0.875em;
}
</style>
