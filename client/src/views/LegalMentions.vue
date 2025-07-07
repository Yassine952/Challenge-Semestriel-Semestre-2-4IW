<template>
  <div class="legal-mentions p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-4">Mentions Légales</h1>
    <p class="text-sm text-gray-600 mb-6"><strong>Dernière mise à jour :</strong> {{ new Date().toLocaleDateString('fr-FR') }}</p>
  
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
      <h2 class="text-2xl font-semibold mb-2">Services proposés</h2>
      <p>Le site propose les services suivants :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Vente en ligne :</strong> Commercialisation de produits mugs et accessoires</li>
        <li><strong>Système d'alertes :</strong> Notifications personnalisées (nouveaux produits, réapprovisionnement, prix)</li>
        <li><strong>Gestion des comptes :</strong> Espace personnel pour le suivi des commandes</li>
        <li><strong>Traitement des retours :</strong> Gestion des demandes de retour et remboursements</li>
        <li><strong>Newsletter :</strong> Informations commerciales et promotionnelles</li>
      </ul>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Propriété intellectuelle</h2>
      <p>Le contenu de ce site (textes, images, photographies, logos, etc.) est la propriété de Lemondedesmugs. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments de ce site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Lemondedesmugs.</p>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Protection des données personnelles</h2>
      <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Droit d'accès :</strong> Consulter les données vous concernant</li>
        <li><strong>Droit de rectification :</strong> Corriger vos informations</li>
        <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
        <li><strong>Droit de portabilité :</strong> Récupérer vos données</li>
        <li><strong>Droit d'opposition :</strong> Refuser le traitement de vos données</li>
        <li><strong>Gestion des alertes :</strong> Modifier vos préférences de notification</li>
      </ul>
      <p class="mt-2">Pour exercer ces droits, contactez-nous par email à <a href="mailto:challenges2iw@gmail.com" class="text-indigo-600 hover:underline">challenges2iw@gmail.com</a>.</p>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Cookies et technologies similaires</h2>
      <p>Ce site utilise des cookies pour :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Fonctionnement essentiel :</strong> Authentification, panier, session</li>
        <li><strong>Préférences utilisateur :</strong> Sauvegarde de vos préférences d'alertes</li>
        <li><strong>Amélioration de l'expérience :</strong> Personnalisation de l'interface</li>
        <li><strong>Paiement sécurisé :</strong> Cookies Stripe pour la prévention des fraudes</li>
      </ul>
      <p class="mt-2">Vous pouvez consulter notre <router-link to="/privacy-policy" class="text-indigo-600 hover:underline">Politique de Confidentialité</router-link> pour en savoir plus sur l'utilisation des cookies.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Traitement des données</h2>
      <p>Les données collectées sont traitées pour :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Gestion des commandes :</strong> Traitement, livraison, facturation</li>
        <li><strong>Service client :</strong> Support et assistance</li>
        <li><strong>Alertes personnalisées :</strong> Envoi de notifications selon vos préférences</li>
        <li><strong>Gestion des retours :</strong> Traitement des demandes de remboursement</li>
        <li><strong>Amélioration des services :</strong> Analyse des préférences utilisateur</li>
      </ul>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Sécurité</h2>
      <p>Nous mettons en œuvre les mesures de sécurité suivantes :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Chiffrement des données :</strong> Utilisation de JWT et HTTPS</li>
        <li><strong>Accès restreint :</strong> Contrôle des accès administrateur</li>
        <li><strong>Sauvegarde régulière :</strong> Protection contre la perte de données</li>
        <li><strong>Monitoring :</strong> Surveillance des accès et des activités</li>
      </ul>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Partenaires et sous-traitants</h2>
      <p>Nous travaillons avec les partenaires suivants :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Stripe :</strong> Traitement des paiements et remboursements</li>
        <li><strong>Service d'emailing :</strong> Envoi des alertes et notifications</li>
        <li><strong>Hébergeur (OVH) :</strong> Stockage et sécurisation des données</li>
      </ul>
      <p class="mt-2">Tous nos partenaires respectent les exigences du RGPD.</p>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Limitation de responsabilité</h2>
      <p>Lemondedesmugs s'efforce de fournir des informations exactes mais ne peut garantir l'absence d'erreurs. La responsabilité de Lemondedesmugs ne saurait être engagée en cas de :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li>Interruption temporaire du service</li>
        <li>Problèmes techniques indépendants de notre volonté</li>
        <li>Utilisation non conforme des services</li>
      </ul>
    </section>
  
    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Litiges</h2>
      <p>En cas de litige, nous privilégions la résolution amiable. À défaut, la législation française s'applique et les tribunaux français sont compétents.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Contact</h2>
      <p>Pour toute question concernant ces mentions légales ou l'exercice de vos droits :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Email :</strong> <a href="mailto:challenges2iw@gmail.com" class="text-indigo-600 hover:underline">challenges2iw@gmail.com</a></li>
        <li><strong>Adresse :</strong> 242 rue du faubourg Saint-Honoré</li>
        <li><strong>Délai de réponse :</strong> 30 jours maximum</li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LegalMentions',
});
</script>
