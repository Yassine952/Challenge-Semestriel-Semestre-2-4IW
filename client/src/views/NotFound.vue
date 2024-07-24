<template>
    <main>
      <div class="max-w-screen-xl mx-auto px-4 flex items-center justify-start h-screen md:px-8">
        <div class="max-w-lg mx-auto space-y-3 text-center">
          <h3 class="text-gray-800 text-4xl font-semibold sm:text-5xl">
            Page non trouvée
          </h3>
          <p class="text-gray-600">
            Désolé, la page que vous recherchez n'a pas pu être trouvée ou a été supprimée.
          </p>
          <router-link to="/" class="text-indigo-600 duration-150 hover:text-indigo-400 font-medium inline-flex items-center gap-x-1">
            Retourner à l'accueil
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clip-rule="evenodd" />
            </svg>
          </router-link>
        </div>
      </div>
    </main>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'NotFound',
  });
  </script>
  
  