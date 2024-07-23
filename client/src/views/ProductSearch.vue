<template>
  <div>
    <h1>Recherche de produits</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="name">Nom:</label>
        <input type="text" v-model="name" />
        <span v-if="nameError">{{ nameError }}</span>
      </div>
      <div>
        <label for="description">Description:</label>
        <input type="text" v-model="description" />
        <span v-if="descriptionError">{{ descriptionError }}</span>
      </div>
      <div>
        <label for="category">Catégorie:</label>
        <select v-model="category">
          <option value="">Toutes les catégories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <span v-if="categoryError">{{ categoryError }}</span>
      </div>
      <div>
        <label for="priceMin">Prix minimum:</label>
        <input type="number" v-model.number="priceMin" step="0.01" />
        <span v-if="priceMinError">{{ priceMinError }}</span>
      </div>
      <div>
        <label for="priceMax">Prix maximum:</label>
        <input type="number" v-model.number="priceMax" step="0.01" />
        <span v-if="priceMaxError">{{ priceMaxError }}</span>
      </div>
      <div>
        <label for="inStock">En stock:</label>
        <input type="checkbox" v-model="inStock" />
        <span v-if="inStockError">{{ inStockError }}</span>
      </div>
      <button type="submit" :disabled="isSubmitting">Rechercher</button>
      <p v-if="serverError" class="error">{{ serverError }}</p>
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
import { z } from 'zod';
import { searchProducts, fetchCategories } from '../services/productService';
import { useForm } from '../composables/useForm';
import { Product } from '../types/Product';

const searchSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  priceMin: z.number().min(0, 'Prix minimum doit être positif').optional(),
  priceMax: z.number().min(0, 'Prix maximum doit être positif').optional(),
  inStock: z.boolean().optional(),
});

export default defineComponent({
  name: 'ProductSearch',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const products = ref<Product[]>([]);
    const categories = ref<string[]>([]);

    const {
      values,
      name,
      description,
      category,
      priceMin,
      priceMax,
      inStock,
      nameError,
      descriptionError,
      categoryError,
      priceMinError,
      priceMaxError,
      inStockError,
      isSubmitting,
      serverError,
      handleChange,
      handleSubmit,
    } = useForm({
      initialValues: {
        name: route.query.q || '',
        description: route.query.description || '',
        category: route.query.category || '',
        priceMin: route.query.priceMin ? Number(route.query.priceMin) : 0,
        priceMax: route.query.priceMax ? Number(route.query.priceMax) : 0,
        inStock: route.query.inStock === 'true',
      },
      schema: searchSchema,
      onSubmit: async (searchCriteria) => {
        const query: any = { ...searchCriteria };

        // Convert the boolean to a string for the query parameters
        query.inStock = searchCriteria.inStock ? 'true' : 'false';

        // Remove unnecessary parameters
        if (!query.name) delete query.name;
        if (!query.description) delete query.description;
        if (!query.category) delete query.category;
        if (!query.priceMin) delete query.priceMin;
        if (!query.priceMax) delete query.priceMax;
        if (query.inStock === 'false') delete query.inStock;

        router.push({ name: 'ProductSearch', query });

        try {
          const response = await searchProducts(query);
          products.value = response;
        } catch (error) {
          console.error('Error searching products:', error);
        }
      },
    });

    const loadCategories = async () => {
      try {
        categories.value = await fetchCategories();
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    watch(route, () => {
      handleChange('name', route.query.name || '');
      handleChange('description', route.query.description || '');
      handleChange('category', route.query.category || '');
      handleChange('priceMin', route.query.priceMin ? Number(route.query.priceMin) : 0);
      handleChange('priceMax', route.query.priceMax ? Number(route.query.priceMax) : 0);
      handleChange('inStock', route.query.inStock === 'true');
      handleSubmit();
    }, { immediate: true });

    onMounted(() => {
      loadCategories();
      handleSubmit();
    });

    return {
      products,
      categories,
      name,
      description,
      category,
      priceMin,
      priceMax,
      inStock,
      nameError,
      descriptionError,
      categoryError,
      priceMinError,
      priceMaxError,
      inStockError,
      isSubmitting,
      serverError,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
