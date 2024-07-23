<template>
  <div class="product-list">
    <h1>Liste des produits</h1>
    <router-link to="/add-product">Ajouter un produit</router-link>
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Description</th>
          <th>Prix</th>
          <th>Stock</th>
          <th>Catégorie</th>
          <th>En Vente</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.description }}</td>
          <td>{{ product.price }}</td>
          <td>{{ product.stock }}</td>
          <td>{{ product.category }}</td>
          <td>{{ product.onSale ? 'Oui' : 'Non' }}</td>
          <td>
            <router-link :to="`/edit-product/${product.id}`">Modifier</router-link>
            <confirm-button
              :delete-url="`/api/products/${product.id}`"
              :onSuccess="loadProducts"
            />
            <button @click="addToCart(product.id)" :disabled="product.stock === 0">
              {{ product.stock === 0 ? 'Stock épuisé' : 'Ajouter au panier' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { fetchProducts } from '../services/productService';
import { Product } from '../types/Product';
import { addToCart } from '../services/cartService';
import ConfirmButton from '../components/ConfirmButton.vue';

export default defineComponent({
  name: 'ProductList',
  components: {
    ConfirmButton,
  },
  setup() {
    const products = ref<Product[]>([]);

    const loadProducts = async () => {
      products.value = await fetchProducts();
    };

    const addToCartHandler = async (productId: number) => {
      await addToCart({ productId, quantity: 1 });
      alert('Produit ajouté au panier');
    };

    onMounted(loadProducts);

    return {
      products,
      loadProducts,
      addToCart: addToCartHandler,
    };
  },
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  
}
</style>
