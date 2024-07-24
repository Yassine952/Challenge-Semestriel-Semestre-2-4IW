<template>
  <main class="w-full h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
    <div class="w-full space-y-6 text-gray-600 sm:max-w-md">
      <div class="text-center">
        <div class="mt-5 space-y-2">
          <h3 class="text-gray-800 text-2xl font-bold sm:text-3xl">
            Ajouter un produit
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
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="nameError" class="text-red-500">{{ nameError }}</span>
          </div>
          <div>
            <label for="description" class="font-medium">Description</label>
            <textarea
              v-model="description"
              @input="handleChange('description', $event.target.value)"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            ></textarea>
            <span v-if="descriptionError" class="text-red-500">{{ descriptionError }}</span>
          </div>
          <div>
            <label for="price" class="font-medium">Prix</label>
            <input
              type="number"
              v-model="price"
              @input="handleChange('price', $event.target.value)"
              step="0.01"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="priceError" class="text-red-500">{{ priceError }}</span>
          </div>
          <div>
            <label for="stock" class="font-medium">Stock</label>
            <input
              type="number"
              v-model="stock"
              @input="handleChange('stock', $event.target.value)"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="stockError" class="text-red-500">{{ stockError }}</span>
          </div>
          <div>
            <label for="category" class="font-medium">Catégorie</label>
            <input
              type="text"
              v-model="category"
              @input="handleChange('category', $event.target.value)"
              required
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="categoryError" class="text-red-500">{{ categoryError }}</span>
          </div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
          >
            Ajouter
          </button>
        </form>
        <p v-if="serverError" class="error mt-4 text-red-500">{{ serverError }}</p>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { useForm } from '../composables/useForm';
import { createProduct } from '../services/productService';

const productSchema = z.object({
  name: z.string().min(1, 'Nom est requis'),
  description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit être un nombre positif'),
  stock: z.number().min(0, 'Le stock doit être un nombre positif'),
  category: z.string().min(1, 'Catégorie est requise'),
});

export default defineComponent({
  name: 'AddProduct',
  setup() {
    const router = useRouter();

    const {
      values,
      nameError,
      descriptionError,
      priceError,
      stockError,
      categoryError,
      isSubmitting,
      serverError,
      handleChange,
      handleSubmit,
    } = useForm({
      initialValues: {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
      },
      schema: productSchema,
      onSubmit: async (product) => {
        try {
          await createProduct(product);
          router.push('/products');
        } catch (error) {
          console.error('Erreur lors de la création du produit:', error);
        }
      },
    });

    return {
      ...values,
      nameError,
      descriptionError,
      priceError,
      stockError,
      categoryError,
      isSubmitting,
      serverError,
      handleChange,
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
