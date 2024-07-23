<template>
    <footer class="site-footer">
      <div class="container">
        <div class="footer-links">
          <router-link to="/legal-mentions">Mentions Légales</router-link>
          <router-link to="/privacy-policy">Politique de Confidentialité</router-link>
        </div>
        <div class="footer-info">
          <p>&copy; 2024 Lemondedesmugs.fr Tous droits réservés.</p>
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
  .site-footer {
    background-color: #333;
    color: #fff;
    padding: 20px 0;
    text-align: center;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .footer-links {
    margin-bottom: 10px;
  }
  
  .footer-links a {
    color: #fff;
    margin: 0 10px;
    text-decoration: none;
  }
  
  .footer-links a:hover {
    text-decoration: underline;
  }
  
  .footer-info {
    font-size: 14px;
  }
  </style>
  