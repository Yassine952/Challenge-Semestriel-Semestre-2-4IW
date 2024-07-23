<template>
  <div id="app">
    <Navbar />
    <div class="content">
      <router-view />
    </div>
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

footer {
  width: 100%;
  text-align: center;
  padding: 20px;
  background-color: #333;
  color: #fff;
}
</style>
