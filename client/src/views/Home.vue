<template>
  <div class="home py-14">
    <div class="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
      <header class="text-center">
        <h1 class="text-gray-800 text-3xl font-semibold sm:text-4xl">
          Bienvenue chez Lemondedesmugs
        </h1>
        <p class="mt-3">
          Découvrez notre collection de mugs en bois, bambou, verre et plastique.
        </p>
      </header>
      <section class="featured-products mt-12">
        <h2 class="text-gray-800 text-2xl font-semibold sm:text-3xl text-center">Produits</h2>
        <div class="relative mt-12">
          <ul class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="product in featuredProducts"
              :key="product.id"
              class="bg-white space-y-3 p-4 border rounded-lg"
            >
              <h5 class="text-lg font-semibold text-gray-800">{{ product.name }}</h5>
              <p class="mt-2 text-base">{{ product.description }}</p>
              <p class="price text-xl text-center font-bold">{{ product.price }} €</p>
              <button
                v-if="isAuthenticated"
                @click="addToCart(product.id)" :disabled="product.stock === 0" class="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150 disabled:opacity-50">
                  {{ product.stock === 0 ? 'Stock épuisé' : 'Ajouter au panier' }}

              </button>
              <p v-else class="text-red-600">Connectez-vous pour ajouter au panier</p>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchProducts } from '../services/productService';
import { Product } from '../types/Product';
import { addToCart } from '../services/cartService';
import { useAuth } from '../composables/useAuth';

export default defineComponent({
  name: 'Home',
  setup() {
    const featuredProducts = ref<Product[]>([]);
    const { isAuthenticated } = useAuth();

    const loadProducts = async () => {
      const allProducts = await fetchProducts();
      featuredProducts.value = allProducts.filter(product => product.onSale);
    };

    const addToCartHandler = async (productId: number) => {
      await addToCart({ productId, quantity: 1 });
      alert('Produit ajouté au panier');
    };

    onMounted(loadProducts);

    return {
      featuredProducts,
      isAuthenticated,
      addToCart: addToCartHandler,
    };
  },
});
</script>
