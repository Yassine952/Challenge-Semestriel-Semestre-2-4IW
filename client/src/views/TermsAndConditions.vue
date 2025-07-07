<template>
  <div class="terms-and-conditions p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-4">Conditions Générales de Vente (CGV)</h1>
    <p class="text-sm text-gray-600 mb-6"><strong>Dernière mise à jour :</strong> {{ new Date().toLocaleDateString('fr-FR') }}</p>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">1. Informations sur l'entreprise</h2>
      <p class="font-bold">Lemondedesmugs</p>
      <p>Adresse : 242 rue du Faubourg Saint Honoré</p>
      <p>Email : challenges2iw@gmail.com</p>
      <p>Téléphone : 06 13 08 10 **</p>
      <p>Numéro SIRET : [Numéro SIRET]</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">2. Objet</h2>
      <p>Les présentes Conditions Générales de Vente régissent les ventes de produits proposés sur le site lemondedesmugs.fr ainsi que les services associés (alertes, notifications, gestion des retours).</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">3. Produits</h2>
      <p>Les produits proposés à la vente sont décrits et présentés avec la plus grande exactitude possible. Les photos et descriptions sont non contractuelles.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">4. Prix</h2>
      <p>Les prix des produits sont indiqués en euros, toutes taxes comprises (TTC), hors frais de livraison. Les frais de livraison sont précisés lors de la validation de la commande.</p>
      <p class="mt-2"><strong>Alertes de prix :</strong> Vous pouvez vous abonner aux alertes de changement de prix pour être informé des variations tarifaires.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">5. Commandes</h2>
      <p>Les commandes se font en ligne sur le site. Une fois la commande validée, un e-mail de confirmation est envoyé au client.</p>
      <p class="mt-2"><strong>Suivi de commande :</strong> Vous pouvez suivre l'état de votre commande dans votre espace personnel.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">6. Paiement</h2>
      <p>Les paiements sont sécurisés et peuvent être effectués par carte bancaire via Stripe. Les données de paiement sont chiffrées et sécurisées.</p>
      <p class="mt-2"><strong>Remboursements :</strong> Les remboursements sont traités via Stripe et peuvent prendre 3 à 5 jours ouvrés pour apparaître sur votre compte.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">7. Livraison</h2>
      <p>Les produits sont livrés à l'adresse indiquée par le client lors de la commande. Les délais de livraison sont indiqués sur le site et peuvent varier en fonction de la destination.</p>
      <p class="mt-2"><strong>Alertes de réapprovisionnement :</strong> Si un produit est en rupture de stock, vous pouvez vous abonner aux alertes de réapprovisionnement.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">8. Droit de rétractation</h2>
      <p>Conformément à la loi, le client dispose de 14 jours pour exercer son droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités.</p>
      <p class="mt-2"><strong>Procédure :</strong> La demande de rétractation peut être effectuée directement depuis votre espace personnel en ligne.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">9. Retour et remboursement</h2>
      <p>Les produits doivent être retournés dans leur état d'origine et complets. En cas de retour conforme, le remboursement sera effectué dans un délai de 14 jours.</p>
      <div class="mt-2 space-y-2">
        <p><strong>Processus de retour :</strong></p>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li>Demande de retour via votre espace personnel</li>
          <li>Indication du motif de retour</li>
          <li>Validation par nos équipes</li>
          <li>Envoi des instructions de retour</li>
          <li>Traitement du remboursement après réception</li>
        </ul>
      </div>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">10. Garanties</h2>
      <p>Les produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">11. Responsabilité</h2>
      <p>Lemondedesmugs ne saurait être tenu responsable des dommages résultant d'une mauvaise utilisation du produit acheté.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">12. Système d'alertes et notifications</h2>
      <p>Notre site propose un système d'alertes personnalisé :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Alertes nouveaux produits :</strong> Notification des nouveautés selon vos préférences</li>
        <li><strong>Alertes de réapprovisionnement :</strong> Notification quand un produit est de nouveau disponible</li>
        <li><strong>Alertes de prix :</strong> Notification des changements de prix</li>
        <li><strong>Newsletter :</strong> Informations générales sur notre boutique</li>
      </ul>
      <p class="mt-2">Ces services sont gratuits et optionnels. Vous pouvez les gérer depuis votre espace personnel.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">13. Données personnelles</h2>
      <p>Les informations recueillies sont nécessaires pour :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li>Le traitement des commandes</li>
        <li>Le service client</li>
        <li>L'envoi d'alertes selon vos préférences</li>
        <li>La gestion des retours et remboursements</li>
      </ul>
      <p class="mt-2">Elles sont traitées conformément à notre <router-link to="/privacy-policy" class="text-indigo-600 hover:underline">politique de confidentialité</router-link>.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">14. Propriété intellectuelle</h2>
      <p>Tous les contenus du site (textes, images, logos) sont protégés par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">15. Cookies</h2>
      <p>Le site utilise des cookies pour améliorer votre expérience et le fonctionnement des services (authentification, panier, préférences d'alertes). Consultez notre <router-link to="/privacy-policy" class="text-indigo-600 hover:underline">politique de cookies</router-link> pour plus d'informations.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">16. Loi applicable et juridiction compétente</h2>
      <p>Les présentes CGV sont soumises à la loi française. En cas de litige, les tribunaux français seront seuls compétents.</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">17. Service client</h2>
      <p>Pour toute réclamation, question ou exercice de vos droits, vous pouvez nous contacter :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Email :</strong> challenges2iw@gmail.com</li>
        <li><strong>Espace personnel :</strong> Via votre compte utilisateur</li>
        <li><strong>Délai de réponse :</strong> 48h maximum</li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TermsAndConditions',
});
</script>
