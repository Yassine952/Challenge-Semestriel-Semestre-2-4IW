<!-- client/src/components/ProductList.vue -->
<template>
  <div class="product-list">
    <div v-for="product in products" :key="product._id" class="product">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
      <p>Category: {{ product.category }}</p>
      <p>Brand: {{ product.brand }}</p>
      <p>Price: {{ product.price }}</p>
      <p v-if="product.onSale">On Sale</p>
      <p v-if="!product.inStock">Out of Stock</p>
    </div>
  </div>
</template>

<script>
export default {
  props: ['products']
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
