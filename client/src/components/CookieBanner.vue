<template>
    <div v-if="showBanner" class="cookie-banner">
      <p>Nous utilisons des cookies pour améliorer votre expérience sur notre site. <router-link to="/privacy-policy">En savoir plus</router-link>.</p>
      <button @click="acceptCookies">Accepter</button>
      <button @click="declineCookies">Refuser</button>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  
  export default defineComponent({
    name: 'CookieBanner',
    setup() {
      const showBanner = ref(false);
  
      const setCookie = (name: string, value: string, days: number) => {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
      };
  
      const getCookie = (name: string) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
      };
  
      const checkCookies = () => {
        const userCookiesPref = getCookie("cookies_accepted");
        if (!userCookiesPref) {
          showBanner.value = true;
        } else {
          showBanner.value = false;
          if (userCookiesPref === "false") {
            // à faire plus tard
          }
        }
      };
  
      const acceptCookies = () => {
        setCookie("cookies_accepted", "true", 30);
        showBanner.value = false;
      };
  
      const declineCookies = () => {
        setCookie("cookies_accepted", "false", 30);
        showBanner.value = false;
      };
  
      onMounted(checkCookies);
  
      return {
        showBanner,
        acceptCookies,
        declineCookies,
      };
    },
  });
  </script>
  
  <style scoped>
  .cookie-banner {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: white;
    border-top: 1px solid #ccc;
    padding: 10px;
    text-align: center;
  }
  </style>
  