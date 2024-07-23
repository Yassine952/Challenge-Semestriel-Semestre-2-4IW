<template>
  <div class="edit-product">
    <h1>Modifier le produit</h1>
    <form @submit.prevent="handleSubmit">
      <div v-if="product">
        <div>
          <label for="name">Nom:</label>
          <input type="text" v-model="name" required />
          <span v-if="nameError">{{ nameError }}</span>
        </div>
        <div>
          <label for="description">Description:</label>
          <textarea v-model="description"></textarea>
          <span v-if="descriptionError">{{ descriptionError }}</span>
        </div>
        <div>
          <label for="price">Prix:</label>
          <input type="number" v-model="price" step="0.01" required />
          <span v-if="priceError">{{ priceError }}</span>
        </div>
        <div>
          <label for="stock">Stock:</label>
          <input type="number" v-model="stock" required />
          <span v-if="stockError">{{ stockError }}</span>
        </div>
        <div>
          <label for="category">Categorie:</label>
          <input type="text" v-model="category" required />
          <span v-if="categoryError">{{ categoryError }}</span>
        </div>
        <div>
          <label for="onSale">En vente:</label>
          <input type="checkbox" v-model="onSale" />
        </div>
        <button type="submit" :disabled="isSubmitting">Save</button>
        <p v-if="serverError" class="error">{{ serverError }}</p>
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
import { z } from 'zod';
import { fetchProductById, updateProduct } from '../services/productService';
import { useForm } from '../composables/useForm';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be a positive number'),
  stock: z.number().min(0, 'Stock must be a positive number'),
  category: z.string().min(1, 'Category is required'),
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
      onSale,
      nameError,
      descriptionError,
      priceError,
      stockError,
      categoryError,
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
        onSale: false,
      },
      schema: productSchema,
      onSubmit: async (updatedProduct) => {
        try {
          await updateProduct(Number(route.params.id), updatedProduct);
          router.push('/products');
        } catch (error) {
          console.error('Error during product update:', error);
        }
      },
    });

    const fetchProduct = async () => {
      try {
        const response = await fetchProductById(Number(route.params.id));
        product.value = response;
        handleChange('name', response.name);
        handleChange('description', response.description);
        handleChange('price', response.price);
        handleChange('stock', response.stock);
        handleChange('category', response.category);
        handleChange('onSale', response.onSale);
      } catch (error) {
        console.error('Error fetching product:', error);
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
      onSale,
      nameError,
      descriptionError,
      priceError,
      stockError,
      categoryError,
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
