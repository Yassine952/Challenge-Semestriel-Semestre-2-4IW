<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
    <!-- 🌟 Navigation fixe -->
    <Navbar />
    
    <!-- 📄 Contenu principal avec padding pour la navbar fixe -->
    <main class="pt-16 min-h-screen flex flex-col">
      <div class="flex-1">
        <router-view class="animate-fade-in" />
      </div>
      
      <!-- 🦶 Footer -->
      <Footer />
    </main>
    
    <!-- 🍪 Banner cookies -->
    <CookieBanner />
    
    <!-- 🔔 Notifications toast -->
    <NotificationContainer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from './components/Navbar.vue';
import CookieBanner from './components/CookieBanner.vue';
import Footer from './components/Footer.vue';
import NotificationContainer from './components/NotificationContainer.vue';

export default defineComponent({
  name: 'App',
  components: {
    Navbar,
    CookieBanner,
    Footer,
    NotificationContainer,
  },
});
</script>

<style>
/* 🎨 Styles globaux pour l'application */
#app {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Animation de transition entre les pages */
.router-view {
  transition: all 0.3s ease-in-out;
}

/* Scrollbar moderne pour l'application */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* Sélection de texte avec la couleur primaire */
::selection {
  background: rgba(59, 130, 246, 0.2);
  color: inherit;
}

/* Focus visible moderne */
:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
  border-radius: 0.5rem;
}
</style>
