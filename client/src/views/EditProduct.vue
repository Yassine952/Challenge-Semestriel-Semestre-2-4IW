<template>
  <div class="edit-product">
    <h1>Modifier le produit</h1>
    <form @submit.prevent="handleSubmit">
      <div v-if="product">
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
          <input type="number" v-model="product.price" required />
        </div>
        <div>
          <label for="stock">Stock:</label>
          <input type="number" v-model="product.stock" required />
        </div>
        <div>
          <label for="category">Category:</label>
          <input type="text" v-model="product.category" required />
        </div>
        <div>
          <label for="onSale">On Sale:</label>
          <input type="checkbox" v-model="product.onSale" />
        </div>
        <button type="submit">Save</button>
      </div>
      <div v-else>
        Loading...
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { fetchProductById, updateProduct } from '../services/productService';
import { Product } from '../types/Product';

export default defineComponent({
  name: 'EditProduct',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const product = ref<Product | null>(null);

    const fetchProduct = async () => {
      try {
        const response = await fetchProductById(Number(route.params.id));
        product.value = response;
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    const handleSubmit = async () => {
      try {
        if (product.value) {
          console.log('Updating product:', product.value);
          const response = await updateProduct(product.value.id, product.value);
          console.log('Product updated successfully:', response);
          router.push('/products');
        }
      } catch (error) {
        console.error('Error updating product:', error);
      }
    };

    onMounted(fetchProduct);

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
