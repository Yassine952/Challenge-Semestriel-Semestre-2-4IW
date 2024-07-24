<template>
  <div class="legal-mentions p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-4">Mentions Légales</h1>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Éditeur du site</h2>
      <p><strong>Nom de l'entreprise :</strong> Lemondedesmugs</p>
      <p><strong>Adresse :</strong> 242 rue du faubourg Saint-Honoré</p>
      <p><strong>Email :</strong> <a href="mailto:challenges2iw@gmail.com" class="text-indigo-600 hover:underline">challenges2iw@gmail.com</a></p>
      <p><strong>URL :</strong> <a href="https://lemondedesmugs.fr/" class="text-indigo-600 hover:underline">https://lemondedesmugs.fr/</a></p>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Hébergeur</h2>
      <p><strong>Nom :</strong> OVH</p>
      <p><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</p>
      <p><strong>Site web :</strong> <a href="https://www.ovh.com/" class="text-indigo-600 hover:underline">https://www.ovh.com/</a></p>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Responsable de la publication</h2>
      <p><strong>Nom :</strong> Lemondedesmugs</p>
      <p><strong>Email :</strong> <a href="mailto:challenges2iw@gmail.com" class="text-indigo-600 hover:underline">challenges2iw@gmail.com</a></p>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Propriété intellectuelle</h2>
      <p>Le contenu de ce site (textes, images, photographies, etc.) est la propriété de Lemondedesmugs. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments de ce site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Lemondedesmugs.</p>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Protection des données personnelles</h2>
      <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d’un droit d’accès, de rectification, de suppression et d’opposition au traitement de vos données personnelles. Pour exercer ces droits, vous pouvez nous contacter par email à <a href="mailto:challenges2iw@gmail.com" class="text-indigo-600 hover:underline">challenges2iw@gmail.com</a>.</p>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Cookies</h2>
      <p>Ce site utilise des cookies pour améliorer votre expérience. Vous pouvez consulter notre <router-link to="/privacy-policy" class="text-indigo-600 hover:underline">Politique de Confidentialité</router-link> pour en savoir plus sur l'utilisation des cookies.</p>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Litiges</h2>
      <p>En cas de litige, la législation française s'applique et les tribunaux français sont compétents.</p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LegalMentions',
});
</script>
