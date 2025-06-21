<template>
  <main class="w-full h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
    <div class="w-full space-y-6 text-gray-600 sm:max-w-md">
      <div class="text-center">
        <div class="mt-5 space-y-2">
          <h3 class="text-gray-800 text-2xl font-bold sm:text-3xl">
            Modifier le produit
          </h3>
        </div>
      </div>
      <div class="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
        <form @submit.prevent="handleSubmit" class="space-y-5" v-if="product">
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
          <div>
            <label for="brand" class="font-medium">Marque</label>
            <input
              type="text"
              v-model="brand"
              @input="handleChange('brand', $event.target.value)"
              class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <span v-if="brandError" class="text-red-500">{{ brandError }}</span>
          </div>
          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="onSale"
              id="onSale"
              @input="handleChange('onSale', $event.target.checked)"
              class="mr-2"
            />
            <label for="onSale" class="font-medium">En vente</label>
          </div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
          >
            Enregistrer
          </button>
          <p v-if="serverError" class="error mt-4 text-red-500">{{ serverError }}</p>
        </form>
        <div v-else>
          <p>Chargement...</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { z } from 'zod';
import { fetchProductById, updateProduct } from '../services/productService';
import { useForm } from '../composables/useForm';

const productSchema = z.object({
  name: z.string().min(1, 'Nom est requis'),
  description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit être un nombre positif'),
  stock: z.number().min(0, 'Le stock doit être un nombre positif'),
  category: z.string().min(1, 'Catégorie est requise'),
  brand: z.string().optional(),
  onSale: z.boolean().optional(),
});

export default defineComponent({
  name: 'EditProduct',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const product = ref(null);

    const {
      values,
      name,
      description,
      price,
      stock,
      category,
      brand,
      onSale,
      nameError,
      descriptionError,
      priceError,
      stockError,
      categoryError,
      brandError,
      onSaleError,
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
        brand: '',
        onSale: false,
      },
      schema: productSchema,
      onSubmit: async (updatedProduct) => {
        try {
          // Convertir le prix en centimes avant l'envoi
          const productToUpdate = {
            ...updatedProduct,
            price: Math.round(updatedProduct.price * 100)
          };
          await updateProduct(Number(route.params.id), productToUpdate);
          router.push('/products');
        } catch (error) {
          console.error('Erreur lors de la mise à jour du produit:', error);
        }
      },
    });

    const fetchProduct = async () => {
      try {
        const response = await fetchProductById(Number(route.params.id));
        product.value = response;
        handleChange('name', response.name);
        handleChange('description', response.description);
        handleChange('price', response.price / 100); // Afficher en euros pour l'utilisateur
        handleChange('stock', response.stock);
        handleChange('category', response.category);
        handleChange('brand', response.brand || '');
        handleChange('onSale', response.onSale);
      } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
      }
    };

    onMounted(fetchProduct);

    return {
      product,
      name,
      description,
      price,
      stock,
      category,
      brand,
      onSale,
      nameError,
      descriptionError,
      priceError,
      stockError,
      categoryError,
      brandError,
      onSaleError,
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
