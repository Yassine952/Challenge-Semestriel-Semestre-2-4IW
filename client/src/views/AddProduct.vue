<template>
  <div class="add-product">
    <h1>Ajouter un produit</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="name">Nom</label>
        <input type="text" v-model="name" @input="handleChange('name', $event.target.value)" required />
        <span v-if="nameError">{{ nameError }}</span>
      </div>
      <div>
        <label for="description">Description:</label>
        <textarea v-model="description" @input="handleChange('description', $event.target.value)"></textarea>
        <span v-if="descriptionError">{{ descriptionError }}</span>
      </div>
      <div>
        <label for="price">Prix:</label>
        <input type="number" v-model="price" @input="handleChange('price', $event.target.value)" step="0.01" required />
        <span v-if="priceError">{{ priceError }}</span>
      </div>
      <div>
        <label for="stock">Stock:</label>
        <input type="number" v-model="stock" @input="handleChange('stock', $event.target.value)" required />
        <span v-if="stockError">{{ stockError }}</span>
      </div>
      <div>
        <label for="category">Categorie:</label>
        <input type="text" v-model="category" @input="handleChange('category', $event.target.value)" required />
        <span v-if="categoryError">{{ categoryError }}</span>
      </div>
      <button type="submit" :disabled="isSubmitting">Ajouter</button>
      <p v-if="serverError" class="error">{{ serverError }}</p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { useForm } from '../composables/useForm';
import { createProduct } from '../services/productService';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be a positive number'),
  stock: z.number().min(0, 'Stock must be a positive number'),
  category: z.string().min(1, 'Category is required'),
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
          console.error('Error during product creation:', error);
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
