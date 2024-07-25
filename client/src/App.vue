<template>
  <div id="app">
    <Navbar />
    <div class="content">
      <router-view />
    </div>
    <CookieBanner />
    <Footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from './components/Navbar.vue';
import CookieBanner from './components/CookieBanner.vue';
import Footer from './components/Footer.vue';

export default defineComponent({
  name: 'App',
  components: {
    Navbar,
    CookieBanner,
    Footer,
  },
});
</script>
<style>
#app {
height: 100vh;
}
</style>
