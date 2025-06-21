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

          <div>
            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="onSale"
                @change="handleChange('onSale', $event.target.checked)"
                class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <span class="font-medium">Mettre en vente (générera une alerte aux clients)</span>
            </label>
          </div>
          
          <!-- Boutons d'action -->
          <div class="flex space-x-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150 disabled:opacity-50 flex items-center justify-center"
            >
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSubmitting ? 'Ajout en cours...' : 'Ajouter le produit' }}
            </button>
            
            <button
              type="button"
              @click="handleCancel"
              :disabled="isSubmitting"
              class="px-4 py-2 text-gray-700 font-medium bg-gray-200 hover:bg-gray-300 rounded-lg duration-150 disabled:opacity-50"
            >
              {{ isSubmitting ? 'Annuler la requête' : 'Annuler' }}
            </button>
          </div>
          
          <!-- Informations sur les transformations -->
          <div v-if="name || description || category" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 class="text-sm font-medium text-blue-800 mb-2">🔄 Transformations appliquées :</h4>
            <ul class="text-xs text-blue-700 space-y-1">
              <li v-if="name">• <strong>Nom :</strong> Première lettre en majuscule</li>
              <li v-if="description">• <strong>Description :</strong> Espaces supprimés</li>
              <li v-if="category">• <strong>Catégorie :</strong> Minuscules et espaces supprimés</li>
              <li v-if="price > 0">• <strong>Prix :</strong> {{ price }}€ (converti en centimes par le serveur)</li>
            </ul>
          </div>
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
  onSale: z.boolean().optional(),
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
      cancelRequest,
      resetForm,
    } = useForm({
      initialValues: {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        onSale: false,
      },
      schema: productSchema,
      transformers: {
        name: (value: string) => {
          const trimmed = value.trim();
          return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        },
        description: (value: string) => value.trim(),
        category: (value: string) => value.trim().toLowerCase(),
        // ✅ Suppression de la conversion côté client - le serveur s'en charge
        // price: (value: number) => Math.round(value * 100),
      },
      onSubmit: async (product) => {
        try {
          await createProduct(product);
          router.push('/products');
        } catch (error) {
          console.error('Erreur lors de la création du produit:', error);
          throw error;
        }
      },
    });

    const handleCancel = () => {
      cancelRequest();
      resetForm();
      router.push('/products');
    };

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
      handleCancel,
      cancelRequest,
    };
  },
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
