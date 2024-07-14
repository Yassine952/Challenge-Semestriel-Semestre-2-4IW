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
            <button @click="deleteProduct(product.id)">Supprimer</button>
            <button @click="addToCart(product.id)">Ajouter au panier</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { fetchProducts, deleteProduct } from '../services/productService';
import { Product } from '../types/Product';
import { addToCart } from '../services/cartService';

export default defineComponent({
  name: 'ProductList',
  setup() {
    const products = ref<Product[]>([]);

    const loadProducts = async () => {
      products.value = await fetchProducts();
    };

    const removeProduct = async (id: number) => {
      await deleteProduct(id);
      loadProducts();
    };

    const addToCartHandler = async (productId: number) => {
      await addToCart({ productId, quantity: 1 });
      alert('Produit ajouté au panier');
    };

    onMounted(loadProducts);

    return {
      products,
      deleteProduct: removeProduct,
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
  background-color: #f2f2f2;
}
</style>
