<template>
  <div>
    <h1>Add Product</h1>
    <ProductForm :product="product" :onSubmit="addProduct" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Product } from '../models/Product';
import ProductForm from '../components/ProductForm.vue';

export default defineComponent({
  components: {
    ProductForm,
  },
  setup() {
    const product = ref<Product>({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
    });

    const addProduct = async (newProduct: Product) => {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProduct),
        });
        if (!response.ok) {
          throw new Error('Failed to add product');
        }
        alert('Product added successfully');
      } catch (error) {
        alert(error.message);
      }
    };

    return { product, addProduct };
  },
});
</script>
