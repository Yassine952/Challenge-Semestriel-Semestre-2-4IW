<template>
  <!-- 🦶 Footer Le Monde des Mugs - Design moderne et épuré -->
  <footer class="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Contenu principal du footer -->
      <div class="py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <!-- Section Marque -->
          <div class="space-y-6">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gradient">Le Monde des Mugs</h3>
            </div>
            <p class="text-neutral-400 leading-relaxed">
              Votre destination privilégiée pour des mugs artisanaux de qualité exceptionnelle. 
              Créé avec passion depuis 2024.
            </p>
          </div>

          <!-- Navigation -->
          <div class="space-y-6">
            <h4 class="text-lg font-semibold text-white">Navigation</h4>
            <nav class="space-y-3">
              <router-link to="/" class="block text-neutral-400 hover:text-primary-400 transition-colors">
                Accueil
              </router-link>
              <router-link to="/products" class="block text-neutral-400 hover:text-primary-400 transition-colors">
                Produits
              </router-link>
              <router-link to="/cart" class="block text-neutral-400 hover:text-primary-400 transition-colors">
                Panier
              </router-link>
              <router-link to="/profile" class="block text-neutral-400 hover:text-primary-400 transition-colors">
                Mon Compte
              </router-link>
            </nav>
          </div>

          <!-- Informations légales -->
          <div class="space-y-6">
            <h4 class="text-lg font-semibold text-white">Informations</h4>
            <nav class="space-y-3">
              <router-link to="/legal-mentions" class="block text-neutral-400 hover:text-primary-400 transition-colors">
                Mentions Légales
              </router-link>
              <router-link to="/privacy-policy" class="block text-neutral-400 hover:text-primary-400 transition-colors">
                Politique de Confidentialité
              </router-link>
              <router-link to="/terms-and-conditions" class="block text-neutral-400 hover:text-primary-400 transition-colors">
                CGV
              </router-link>
            </nav>
          </div>
        </div>
      </div>

      <!-- Barre de séparation -->
      <div class="border-t border-neutral-700"></div>

      <!-- Copyright -->
      <div class="py-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div class="text-neutral-400 text-sm">
            © 2024 Le Monde des Mugs. Tous droits réservés.
          </div>
          <div class="flex items-center space-x-6 text-sm text-neutral-400">
            <span class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Paiement sécurisé</span>
            </span>
            <span class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Livraison rapide</span>
            </span>
            <span class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Fait avec ❤️</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Footer',
});
</script>

<style scoped>
/* Animations pour les liens */
.transition-colors {
  transition: color 0.2s ease-in-out;
}

/* Effet de hover sur les icônes sociales */
.group:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}

/* Gradient pour le logo */
.text-gradient {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
