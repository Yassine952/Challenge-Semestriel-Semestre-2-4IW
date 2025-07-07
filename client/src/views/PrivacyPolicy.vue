<template>
  <div class="privacy-policy p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-4">Politique de Confidentialité</h1>
    <p><strong>Nom de l'entreprise</strong> : Lemondedesmugs</p>
    <p><strong>URL</strong> : <a href="https://lemondedesmugs.fr/" class="text-indigo-600 hover:underline">https://lemondedesmugs.fr/</a></p>
    <p><strong>Adresse physique</strong> : 242 rue du faubourg Saint-Honoré</p>
    <p><strong>Adresse email</strong> : <a href="mailto:challenges2iw@gmail.com" class="text-indigo-600 hover:underline">challenges2iw@gmail.com</a></p>
    <p><strong>Dernière mise à jour</strong> : {{ new Date().toLocaleDateString('fr-FR') }}</p>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Données personnelles collectées</h2>
      <p>Nous collectons les informations suivantes :</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Informations d'identification :</strong> Nom, prénom, adresse email</li>
        <li><strong>Informations de livraison :</strong> Adresse de livraison complète</li>
        <li><strong>Informations de commande :</strong> Historique des achats, montants, produits commandés</li>
        <li><strong>Informations de retour :</strong> Demandes de retour, raisons, statuts de remboursement</li>
        <li><strong>Préférences d'alertes :</strong> Types d'alertes souhaitées, catégories d'intérêt</li>
        <li><strong>Historique des notifications :</strong> Alertes envoyées, statuts de lecture</li>
        <li><strong>Données de paiement :</strong> Informations de transaction Stripe (sans données bancaires)</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Objectifs de la collecte des données</h2>
      <p>Les données personnelles collectées sont utilisées pour :</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Traitement des commandes :</strong> Gestion des achats, livraisons et facturation</li>
        <li><strong>Gestion des retours :</strong> Traitement des demandes de retour et remboursements</li>
        <li><strong>Système d'alertes :</strong> Envoi de notifications personnalisées selon vos préférences</li>
        <li><strong>Communication :</strong> Envoi d'emails de notification pour nouveaux produits, réapprovisionnements, changements de prix</li>
        <li><strong>Amélioration du service :</strong> Analyse des préférences pour personnaliser l'expérience</li>
        <li><strong>Gestion comptable :</strong> Génération de rapports financiers et factures</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Système d'alertes et notifications</h2>
      <p>Notre plateforme propose un système d'alertes personnalisé :</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Alertes nouveaux produits :</strong> Notification lors de l'ajout de nouveaux articles</li>
        <li><strong>Alertes réapprovisionnement :</strong> Notification quand un produit est de nouveau en stock</li>
        <li><strong>Alertes changements de prix :</strong> Notification des variations de prix</li>
        <li><strong>Newsletter :</strong> Informations générales sur notre boutique</li>
        <li><strong>Préférences par catégorie :</strong> Filtrage des alertes selon vos centres d'intérêt</li>
      </ul>
      <p class="mt-2 text-sm text-gray-600">Vous pouvez gérer ces préférences à tout moment dans votre profil utilisateur.</p>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Gestion des commandes et remboursements</h2>
      <p>Nous traitons et conservons les informations suivantes :</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Historique des commandes :</strong> Détails des achats, statuts, dates</li>
        <li><strong>Demandes de retour :</strong> Raisons, dates, statuts de traitement</li>
        <li><strong>Informations de remboursement :</strong> Montants, dates, identifiants de transaction</li>
        <li><strong>Données Stripe :</strong> Identifiants de paiement pour le traitement des remboursements</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Partage des données</h2>
      <p>Nous partageons certaines informations avec des services tiers pour faciliter nos opérations :</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Stripe :</strong> Traitement des paiements et remboursements. Stripe utilise des cookies pour prévenir les fraudes et évaluer les risques.</li>
        <li><strong>Service d'emailing :</strong> Envoi des alertes et notifications selon vos préférences</li>
        <li><strong>Hébergement :</strong> Stockage sécurisé des données sur nos serveurs</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Conservation des données</h2>
      <p>Nous conservons vos données selon les durées suivantes :</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Données de compte :</strong> Tant que votre compte est actif</li>
        <li><strong>Historique des commandes :</strong> 10 ans (obligations comptables)</li>
        <li><strong>Historique des alertes :</strong> 2 ans maximum</li>
        <li><strong>Données de paiement :</strong> Selon les exigences Stripe et réglementaires</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Sécurité des données</h2>
      <p>Nous prenons la sécurité de vos données personnelles très au sérieux :</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Chiffrement :</strong> Utilisation de tokens JWT pour sécuriser l'accès</li>
        <li><strong>Accès restreint :</strong> Seuls les administrateurs autorisés peuvent accéder aux données</li>
        <li><strong>Audit des accès :</strong> Traçabilité des consultations de données</li>
        <li><strong>Sauvegarde sécurisée :</strong> Stockage redondant et chiffré</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Droits des utilisateurs</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Droit d'accès :</strong> Consulter toutes les données vous concernant</li>
        <li><strong>Droit de rectification :</strong> Corriger vos informations personnelles</li>
        <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
        <li><strong>Droit de portabilité :</strong> Récupérer vos données dans un format structuré</li>
        <li><strong>Droit d'opposition :</strong> Refuser le traitement de vos données</li>
        <li><strong>Gestion des alertes :</strong> Modifier ou désactiver vos préférences d'alertes</li>
      </ul>
      <p class="mt-2">Pour exercer ces droits, contactez-nous à <a href="mailto:challenges2iw@gmail.com" class="text-indigo-600 hover:underline">challenges2iw@gmail.com</a>.</p>
    </section>

    <h1 class="text-3xl font-bold mt-10 mb-4">Politique de Cookies</h1>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Cookies Essentiels</h2>
      <p>Nous utilisons des cookies essentiels pour garantir le bon fonctionnement de notre site :</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Cookies d'authentification :</strong> Maintien de votre session utilisateur</li>
        <li><strong>Cookies de panier :</strong> Sauvegarde de votre panier d'achat</li>
        <li><strong>Cookies de préférences :</strong> Mémorisation de vos préférences d'alertes</li>
        <li><strong>Cookies Stripe :</strong></li>
        <ul class="list-disc list-inside ml-6">
          <li><strong>__stripe_mid</strong> : Prévention de la fraude / Essentiels / 1 an</li>
          <li><strong>__stripe_sid</strong> : Prévention de la fraude / Essentiels / 30 minutes</li>
        </ul>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Cookies de Fonctionnalité</h2>
      <p>Ces cookies améliorent votre expérience utilisateur :</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Cookies de notification :</strong> Gestion de l'affichage des alertes</li>
        <li><strong>Cookies de recherche :</strong> Mémorisation de vos dernières recherches</li>
        <li><strong>Cookies de préférences d'affichage :</strong> Sauvegarde de vos préférences d'interface</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Gestion des Cookies</h2>
      <p>Vous pouvez gérer vos préférences en matière de cookies :</p>
      <ul class="list-disc list-inside space-y-1">
        <li>Utiliser notre bannière de cookies lors de votre première visite</li>
        <li>Modifier vos préférences dans les paramètres de votre navigateur</li>
        <li>Désactiver les cookies non essentiels à tout moment</li>
      </ul>
      <p class="mt-2 text-sm text-gray-600">Note : La désactivation de certains cookies peut affecter le fonctionnement du site.</p>
    </section>

    <section class="mt-6">
      <h2 class="text-2xl font-semibold mb-2">Contact</h2>
      <p>Pour toute question concernant notre politique de confidentialité ou l'exercice de vos droits, contactez-nous :</p>
      <ul class="list-disc list-inside space-y-1">
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
  name: 'PrivacyPolicy',
});
</script>
