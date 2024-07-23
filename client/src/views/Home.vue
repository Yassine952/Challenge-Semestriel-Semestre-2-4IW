<template>
  <div class="home">
    <header>
      <h1>Bienvenue chez Lemondedesmugs</h1>
      <p>Découvrez notre collection de mugs en bois, bambou, verre et plastique.</p>
    </header>
    <section class="featured-products">
      <h2>Produits</h2>
      <div class="product-grid">
        <div class="product" v-for="product in featuredProducts" :key="product.id">
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
          <p class="price">{{ product.price }} €</p>
          <button v-if="isAuthenticated" @click="addToCart(product.id)">Ajouter au panier</button>
          <p v-else>Connectez-vous pour ajouter au panier</p>
        </div>
      </div>
    </section>
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

<style scoped>
.home {
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

.featured-products {
  text-align: center;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.product {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  width: calc(33.333% - 40px);
  box-sizing: border-box;
  text-align: center;
}

.product img {
  max-width: 100%;
  height: auto;
}

.product h3 {
  margin: 10px 0;
}

.product .price {
  color: #d32f2f;
  font-weight: bold;
}

button {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: #b71c1c;
}
</style>
