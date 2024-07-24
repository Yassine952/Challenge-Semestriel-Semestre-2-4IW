<template>
  <div class="privacy-policy p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-4">Politique de Confidentialité</h1>
    <p><strong>Nom de l'entreprise</strong> : Lemondedesmugs</p>
    <p><strong>URL</strong> : <a href="https://lemondedesmugs.fr/" class="text-indigo-600 hover:underline">https://lemondedesmugs.fr/</a></p>
    <p><strong>Adresse physique</strong> : 242 rue du faubourg Saint-Honoré</p>
    <p><strong>Adresse email</strong> : <a href="mailto:challenges2iw@gmail.com" class="text-indigo-600 hover:underline">challenges2iw@gmail.com</a></p>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Données personnelles collectées</h2>
      <p>Nous collectons les informations suivantes :</p>
      <ul class="list-disc list-inside">
        <li>Nom</li>
        <li>Prénom</li>
        <li>Adresse email</li>
        <li>Adresse de livraison</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Objectifs de la collecte des données</h2>
      <p>Les données personnelles collectées sont utilisées pour :</p>
      <ul class="list-disc list-inside">
        <li>Le traitement des commandes</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Partage des données</h2>
      <p>Nous partageons certaines informations avec des services tiers pour faciliter nos opérations :</p>
      <ul class="list-disc list-inside">
        <li><strong>Stripe</strong> : Nous utilisons Stripe pour traiter les paiements. Stripe utilise des cookies pour prévenir les fraudes et évaluer les risques associés aux transactions.</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Sécurité des données</h2>
      <p>Nous prenons la sécurité de vos données personnelles très au sérieux. Nous utilisons des jetons JWT (JSON Web Tokens) pour sécuriser l'accès à nos services.</p>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Droits des utilisateurs</h2>
      <p>Vous avez le droit d'accéder, de rectifier et de supprimer vos données personnelles. Pour demander la suppression de vos données, veuillez nous contacter par email à <a href="mailto:challenges2iw@gmail.com" class="text-indigo-600 hover:underline">challenges2iw@gmail.com</a>.</p>
    </section>

    <h1 class="text-3xl font-bold mt-10 mb-4">Politique de Cookies</h1>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Cookies Essentiels</h2>
      <p>Nous utilisons des cookies essentiels pour garantir le bon fonctionnement de notre site et de nos services. Voici les cookies utilisés par Stripe :</p>
      <ul class="list-disc list-inside">
        <li><strong>__stripe_mid</strong> : Utilisé à des fins de prévention de la fraude et pour évaluer les risques associés à une transaction. / Essentiels / 1 an</li>
        <li><strong>__stripe_sid</strong> : Utilisé à des fins de prévention de la fraude et pour évaluer les risques associés à une transaction. / Essentiels / 30 minutes</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Gestion des Cookies</h2>
      <p>Vous pouvez gérer vos préférences en matière de cookies en utilisant notre bannière de cookies. Vous avez le droit de refuser les cookies non essentiels à tout moment.</p>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Contact</h2>
      <p>Si vous avez des questions concernant notre politique de confidentialité, veuillez nous contacter à <a href="mailto:challenges2iw@gmail.com" class="text-indigo-600 hover:underline">challenges2iw@gmail.com</a>.</p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PrivacyPolicy',
});
</script>
