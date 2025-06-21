<template>
  <!-- 🌟 Navbar Aurora - 100% Tailwind CSS -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-700/50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- 🎨 Logo et titre -->
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div class="hidden md:block">
            <h1 class="text-xl font-bold text-gradient">Le Monde des Mugs</h1>
      </div>
        </div>

        <!-- 🔍 Barre de recherche moderne -->
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <form @submit.prevent="performSearch" class="w-full">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
              </div>
            <input
                v-model="searchQuery"
              type="text"
                placeholder="Rechercher des produits..."
                class="w-full pl-10 pr-16 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              @keypress.enter="performSearch"
            />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <!-- Raccourci clavier supprimé -->
              </div>
            </div>
          </form>
        </div>

        <!-- 🧭 Navigation principale -->
        <div class="hidden lg:flex items-center space-x-1">
          <router-link to="/" class="relative px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200">
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Accueil
          </router-link>

          <!-- Navigation pour utilisateurs non connectés -->
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="relative px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200">
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Connexion
            </router-link>
            <router-link to="/register" class="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
              S'inscrire
            </router-link>
          </template>

          <!-- Navigation pour utilisateurs connectés -->
          <template v-if="isLoggedIn">
            <!-- Menu Store Keeper / Admin -->
            <div v-if="hasRole('ROLE_STORE_KEEPER') || hasRole('ROLE_ADMIN')" class="relative group">
              <button class="relative px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-6 4h6" />
                </svg>
                Gestion
                <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown menu avec zone de transition -->
              <div class="absolute top-full left-0 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50">
                <div class="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 py-2 transform translate-y-1 group-hover:translate-y-0">
                  <router-link to="/products" class="flex items-center px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Produits
                  </router-link>
                  <router-link to="/promotions" class="flex items-center px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Promotions
                  </router-link>
                  <router-link to="/stock-dashboard" class="flex items-center px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-accent-50 dark:hover:bg-accent-900/20 hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard Stocks
                  </router-link>
                  <router-link to="/newsletter-manager" class="flex items-center px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Newsletter
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Menu Admin -->
            <div v-if="hasRole('ROLE_ADMIN')" class="relative group">
              <button class="relative px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin
                <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown menu avec zone de transition -->
              <div class="absolute top-full left-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50">
                <div class="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 py-2 transform translate-y-1 group-hover:translate-y-0">
                  <router-link to="/admin-dashboard" class="flex items-center px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Tableau de bord
                  </router-link>
                  <router-link to="/dashboard-analytics" class="flex items-center px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Analytics
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Menu Comptabilité -->
            <div v-if="hasRole('ROLE_COMPTA')" class="relative group">
              <router-link to="/compta-dashboard" class="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Comptabilité
              </router-link>
            </div>

            <!-- Notifications -->
            <NotificationDropdown />

            <!-- Panier -->
            <router-link to="/cart" class="relative px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200">
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8.5M19 13v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" />
              </svg>
              Panier
            </router-link>

            <!-- Menu utilisateur -->
            <div class="relative group">
              <button class="flex items-center space-x-2 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <svg class="w-4 h-4 text-neutral-400 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown menu avec zone de transition -->
              <div class="absolute top-full right-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50">
                <div class="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 py-2 transform translate-y-1 group-hover:translate-y-0">
                  <router-link to="/profile" class="flex items-center px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mon Profil
                  </router-link>
                  <div class="border-t border-neutral-200 dark:border-neutral-700 my-2"></div>
                  <button @click="logout" class="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 📱 Menu mobile -->
        <div class="lg:hidden">
          <button @click="toggleMobileMenu" class="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 📱 Menu mobile overlay -->
    <div v-if="showMobileMenu" class="lg:hidden fixed inset-0 top-16 bg-black/50 backdrop-blur-sm z-40" @click="showMobileMenu = false">
      <div class="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-r border-neutral-200/50 dark:border-neutral-700/50 w-80 h-full p-6 transform transition-transform duration-300 ease-in-out" :class="{ 'translate-x-0': showMobileMenu, '-translate-x-full': !showMobileMenu }">
        <!-- Barre de recherche mobile -->
        <div class="mb-6">
          <form @submit.prevent="performSearch">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher..."
                class="w-full pl-10 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                @keypress.enter="performSearch"
              />
            </div>
          </form>
        </div>

        <!-- Navigation mobile -->
        <nav class="space-y-2">
          <router-link to="/" class="flex items-center p-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" @click="showMobileMenu = false">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Accueil
          </router-link>

          <template v-if="!isLoggedIn">
            <router-link to="/login" class="flex items-center p-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" @click="showMobileMenu = false">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Connexion
            </router-link>
            <router-link to="/register" class="flex items-center p-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" @click="showMobileMenu = false">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              S'inscrire
            </router-link>
          </template>

          <template v-if="isLoggedIn">
            <!-- Menu mobile pour utilisateurs connectés -->
            <router-link to="/cart" class="flex items-center p-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" @click="showMobileMenu = false">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8.5M19 13v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" />
              </svg>
              Panier
            </router-link>
            
            <router-link to="/profile" class="flex items-center p-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" @click="showMobileMenu = false">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mon Profil
            </router-link>

            <!-- Liens admin/store keeper mobile -->
            <template v-if="hasRole('ROLE_STORE_KEEPER') || hasRole('ROLE_ADMIN')">
              <div class="border-t border-neutral-200 dark:border-neutral-700 my-4 pt-4">
                <h3 class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Gestion</h3>
                <router-link to="/products" class="flex items-center p-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" @click="showMobileMenu = false">
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Produits
                </router-link>
                <router-link to="/stock-dashboard" class="flex items-center p-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors" @click="showMobileMenu = false">
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard Stocks
                </router-link>
              </div>
            </template>

            <template v-if="hasRole('ROLE_ADMIN')">
              <div class="border-t border-neutral-200 dark:border-neutral-700 my-4 pt-4">
                <h3 class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Administration</h3>
                <router-link to="/admin-dashboard" class="flex items-center p-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors" @click="showMobileMenu = false">
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Tableau de bord
                </router-link>
              </div>
            </template>

            <template v-if="hasRole('ROLE_COMPTA')">
              <div class="border-t border-neutral-200 dark:border-neutral-700 my-4 pt-4">
                <h3 class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Comptabilité</h3>
                <router-link to="/compta-dashboard" class="flex items-center p-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" @click="showMobileMenu = false">
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Dashboard Comptabilité
                </router-link>
              </div>
            </template>

            <div class="border-t border-neutral-200 dark:border-neutral-700 my-4 pt-4">
              <button @click="logout" class="w-full flex items-center p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Se déconnecter
              </button>
            </div>
          </template>
        </nav>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import NotificationDropdown from './NotificationDropdown.vue';

interface DecodedToken {
  role: string;
}

export default defineComponent({
  name: 'Navbar',
  components: {
    NotificationDropdown
  },
  setup() {
    const router = useRouter();
    const isLoggedIn = ref<boolean>(!!localStorage.getItem('token'));
    const roles = ref<string[]>([]);
    const searchQuery = ref<string>('');
    
    // État pour le menu mobile uniquement
    const showMobileMenu = ref<boolean>(false);

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      isLoggedIn.value = false;
      roles.value = [];
      router.push('/login');
    };

    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      isLoggedIn.value = !!token;
      if (token) {
        const decoded: DecodedToken = jwtDecode(token);
        roles.value = [decoded.role];
      } else {
        roles.value = [];
      }
    };

    const hasRole = (role: string) => {
      return roles.value.includes(role);
    };

    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({ name: 'ProductSearch', query: { q: searchQuery.value.trim() } });
        searchQuery.value = '';
        showMobileMenu.value = false;
      }
    };

    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value;
    };

    onMounted(() => {
      checkLoginStatus();
      window.addEventListener('loginStatusChanged', checkLoginStatus);
    });

    return { 
      isLoggedIn, 
      logout, 
      searchQuery, 
      performSearch, 
      hasRole, 
      showMobileMenu,
      toggleMobileMenu
    };
  },
});
</script>

<style scoped>
/* Animations personnalisées pour les dropdowns */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slideDown 0.2s ease-out;
}

/* Styles pour les liens actifs */
.router-link-active.nav-link {
  @apply text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20;
}

.router-link-active.nav-link::after {
  content: '';
  @apply absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary-500 rounded-full;
}

/* Effet de glassmorphism pour les dropdowns */
.dropdown-glass {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Responsive pour les très petits écrans */
@media (max-width: 320px) {
  .w-80 {
    width: 100vw;
  }
}
</style>
