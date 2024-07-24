<template>
  <div class="max-w-screen-xl mx-auto px-4 md:px-8">
    <div class="max-w-lg sm:mx-auto sm:text-center">
      <h3 class="text-gray-800 text-4xl font-semibold sm:text-5xl">
        Liste des produits
      </h3>
      <p class="leading-relaxed mt-2 text-gray-600 text-[15px]">
        Découvrez notre collection de produits.
      </p>
    </div>
    <div class="mt-8 sm:mt-12">
      <router-link to="/add-product" class="text-indigo-600 duration-150 hover:text-indigo-400 font-medium inline-flex items-center gap-x-1 mb-4">
        Ajouter un produit
      </router-link>
      <div class="shadow-sm border rounded-lg overflow-x-auto">
        <table class="w-full table-auto text-sm text-left">
          <thead class="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th class="py-3 px-6">Nom</th>
              <th class="py-3 px-6">Description</th>
              <th class="py-3 px-6">Prix</th>
              <th class="py-3 px-6">Stock</th>
              <th class="py-3 px-6">Catégorie</th>
              <th class="py-3 px-6">En Vente</th>
              <th class="py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 divide-y">
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ product.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.price }} €</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.stock }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.onSale ? 'Oui' : 'Non' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <router-link :to="`/edit-product/${product.id}`" class="text-indigo-600 hover:text-indigo-400">Modifier</router-link>
                <confirm-button :delete-url="`/api/products/${product.id}`" :onSuccess="loadProducts" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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

</style>
