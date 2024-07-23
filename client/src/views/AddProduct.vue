<template>
  <div class="add-product">
    <h1>Ajouter un produit</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="name">Name:</label>
        <input type="text" v-model="product.name" required />
      </div>
      <div>
        <label for="description">Description:</label>
        <textarea v-model="product.description"></textarea>
      </div>
      <div>
        <label for="price">Price:</label>
        <input type="number" v-model="product.price" step="0.01" required />
      </div>
      <div>
        <label for="stock">Stock:</label>
        <input type="number" v-model="product.stock" required />
      </div>
      <div>
        <label for="category">Category:</label>
        <input type="text" v-model="product.category" required />
      </div>
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createProduct } from '../services/productService';
import { Product } from '../types/Product';

export default defineComponent({
  name: 'AddProduct',
  setup() {
    const router = useRouter();

    const product = ref<Product>({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: ''
    });

    const handleSubmit = async () => {
      try {
        console.log('Adding product:', product.value);
        const response = await createProduct(product.value);
        console.log('Product added successfully:', response);
        router.push('/products');
      } catch (error) {
        console.error('Error adding product:', error);
      }
    };

    return {
      product,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
