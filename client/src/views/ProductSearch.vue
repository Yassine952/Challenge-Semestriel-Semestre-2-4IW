<template>
  <main class="w-full h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
    <div class="w-full space-y-6 text-gray-600 sm:max-w-md">
      <div class="text-center">
        <div class="mt-5 space-y-2">
          <h3 class="text-gray-800 text-2xl font-bold sm:text-3xl">
            Recherche de produits
          </h3>
        </div>
      </div>
      <div class="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label for="name" class="font-medium">Nom</label>
            <input
              type="text"
              v-model="name"
              @input="handleChange('name', $event.target.value)"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="nameError" class="text-red-500">{{ nameError }}</span>
          </div>
          <div>
            <label for="description" class="font-medium">Description</label>
            <input
              type="text"
              v-model="description"
              @input="handleChange('description', $event.target.value)"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="descriptionError" class="text-red-500">{{ descriptionError }}</span>
          </div>
          <div>
            <label for="category" class="font-medium">Catégorie</label>
            <select
              v-model="category"
              @input="handleChange('category', $event.target.value)"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <span v-if="categoryError" class="text-red-500">{{ categoryError }}</span>
          </div>
          <div>
            <label for="priceMin" class="font-medium">Prix minimum</label>
            <input
              type="number"
              v-model.number="priceMin"
              @input="handleChange('priceMin', $event.target.value)"
              step="0.01"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="priceMinError" class="text-red-500">{{ priceMinError }}</span>
          </div>
          <div>
            <label for="priceMax" class="font-medium">Prix maximum</label>
            <input
              type="number"
              v-model.number="priceMax"
              @input="handleChange('priceMax', $event.target.value)"
              step="0.01"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="priceMaxError" class="text-red-500">{{ priceMaxError }}</span>
          </div>
          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="inStock"
              id="inStock"
              @input="handleChange('inStock', $event.target.checked)"
              class="mr-2"
            />
            <label for="inStock" class="font-medium">En stock</label>
          </div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
          >
            Rechercher
          </button>
          <p v-if="serverError" class="error mt-4 text-red-500">{{ serverError }}</p>
        </form>
        <div v-if="products.length === 0" class="mt-6 text-center text-gray-600">
          Aucun produit trouvé.
        </div>
        <ul v-else class="mt-6 space-y-3">
          <li v-for="product in products" :key="product.id" class="bg-white p-4 shadow rounded-lg">
            <h4 class="font-semibold text-gray-800">{{ product.name }}</h4>
            <p class="text-gray-600">{{ product.description }}</p>
            <p class="text-gray-800 font-medium">{{ product.price }} €</p>
            <p class="text-gray-600">{{ product.stock }} en stock</p>
          </li>
        </ul>
      </div>
    </div>
  </main>
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

        query.inStock = searchCriteria.inStock ? 'true' : 'false';

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
