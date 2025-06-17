<template>
  <div v-if="showBanner" class="fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4 shadow-lg flex items-center justify-between z-50">
    <p class="text-sm">
      Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
      <router-link to="/privacy-policy" class="underline text-indigo-400 ml-1">En savoir plus</router-link>.
    </p>
    <div class="flex space-x-2">
      <button @click="acceptCookies" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md">Accepter</button>
      <button @click="declineCookies" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md">Refuser</button>
    </div>
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
