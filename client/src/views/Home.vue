<template>
  <div class="home">
    <header>
      <h1>Bienvenue chez Udyr</h1>
      <p>Découvrez notre nouvelle collection de vêtements élégants et confortables.</p>
    </header>
    <section class="featured-products">
      <h2>Produits</h2>
      <div class="product" v-for="product in featuredProducts" :key="product.id">
        <img :src="product.image" :alt="product.name" />
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <p class="price">{{ product.price }} €</p>
      </div>
    </section>
  </div>
</template>

<script>


</script>

<style scoped>

</style>
