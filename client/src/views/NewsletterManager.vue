<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">📧 Gestionnaire de Newsletter</h1>
            <p class="text-gray-600">Créez et envoyez des newsletters personnalisées à vos clients</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Destinataires potentiels</div>
            <div class="text-2xl font-bold text-blue-600">{{ recipientCount }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Configuration -->
        <div class="space-y-6">
          <!-- Personnalisation -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">🎨 Personnalisation</h2>
            
            <div class="space-y-4">
              <!-- Titre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Titre de la newsletter</label>
                <input
                  v-model="newsletterConfig.title"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="📧 Newsletter - Nouveaux produits"
                >
              </div>

              <!-- Message -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Message d'introduction</label>
                <textarea
                  v-model="newsletterConfig.message"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Découvrez nos derniers produits..."
                ></textarea>
              </div>

              <!-- Texte du bouton -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Texte du bouton</label>
                <input
                  v-model="newsletterConfig.buttonText"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Voir tous les produits"
                >
              </div>

              <!-- Couleurs -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Couleur de fond</label>
                  <div class="flex items-center space-x-2">
                    <input
                      v-model="newsletterConfig.backgroundColor"
                      type="color"
                      class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    >
                    <input
                      v-model="newsletterConfig.backgroundColor"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Couleur du texte</label>
                  <div class="flex items-center space-x-2">
                    <input
                      v-model="newsletterConfig.textColor"
                      type="color"
                      class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    >
                    <input
                      v-model="newsletterConfig.textColor"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sélection des produits -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">📦 Sélection des produits</h2>
            
            <div class="space-y-4">
              <!-- Recherche -->
              <div>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Rechercher des produits..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>

              <!-- Liste des produits -->
              <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <div v-if="filteredProducts.length === 0" class="p-4 text-center text-gray-500">
                  Aucun produit trouvé
                </div>
                <div
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  :class="{ 'bg-blue-50 border-blue-200': selectedProductIds.includes(product.id) }"
                  @click="toggleProduct(product)"
                >
                  <input
                    type="checkbox"
                    :checked="selectedProductIds.includes(product.id)"
                    class="mr-3 h-4 w-4 text-blue-600 pointer-events-none"
                    readonly
                  >
                  <div class="flex-1">
                    <div class="font-medium text-gray-900 flex items-center gap-2" :class="{ 'text-blue-900': selectedProductIds.includes(product.id) }">
                      {{ product.name }}
                      <svg v-if="selectedProductIds.includes(product.id)" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div class="text-sm text-gray-500">{{ product.category }} • {{ (product.price / 100).toFixed(2) }}€</div>
                  </div>
                  <div class="text-sm text-gray-500">Stock: {{ product.stock }}</div>
                </div>
              </div>

              <!-- Produits sélectionnés -->
              <div v-if="selectedProductIds.length > 0" class="bg-blue-50 rounded-lg p-3">
                <div class="text-sm font-medium text-blue-900 mb-2">
                  {{ selectedProductIds.length }} produit(s) sélectionné(s)
                </div>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="productId in selectedProductIds"
                    :key="productId"
                    class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {{ getProductName(productId) }}
                    <button
                      @click="removeProduct(productId)"
                      class="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div class="flex space-x-4">
              <button
                @click="previewNewsletter"
                :disabled="selectedProductIds.length === 0 || isLoading"
                class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {{ isLoading ? 'Chargement...' : '👁️ Prévisualiser' }}
              </button>
              <button
                @click="sendNewsletter"
                :disabled="selectedProductIds.length === 0 || !previewData || isSending"
                class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {{ isSending ? 'Envoi...' : '📧 Envoyer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Prévisualisation -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">👁️ Prévisualisation</h2>
          
          <div v-if="!previewData" class="text-center text-gray-500 py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            <p>Sélectionnez des produits et cliquez sur "Prévisualiser"</p>
          </div>

          <div v-else class="space-y-4">
            <!-- Info sur l'envoi -->
            <div class="bg-blue-50 rounded-lg p-4 text-sm">
              <div class="font-medium text-blue-900">Informations d'envoi</div>
              <div class="text-blue-700 mt-1">
                Cette newsletter sera envoyée à <strong>{{ previewData.recipientCount }}</strong> utilisateur(s)
                avec <strong>{{ previewData.productsCount }}</strong> produit(s).
              </div>
            </div>

            <!-- Prévisualisation HTML -->
            <div class="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <div v-html="previewData.previewHtml" class="newsletter-preview"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useNotifications } from '../composables/useNotifications';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

interface PreviewData {
  previewHtml: string;
  recipientCount: number;
  productsCount: number;
  products: Product[];
  settings: {
    title: string;
    message: string;
    buttonText: string;
    backgroundColor: string;
    textColor: string;
  };
}

export default defineComponent({
  name: 'NewsletterManager',
  setup() {
    const { showSuccess, showError, showInfo } = useNotifications();
    const products = ref<Product[]>([]);
    const selectedProductIds = ref<number[]>([]);
    const searchQuery = ref('');
    const isLoading = ref(false);
    const isSending = ref(false);
    const previewData = ref<PreviewData | null>(null);
    const recipientCount = ref(0);

    const newsletterConfig = ref({
      title: '📧 Newsletter - Nouveaux produits',
      message: 'Découvrez nos derniers produits :',
      buttonText: 'Voir tous les produits',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff'
    });

    const filteredProducts = computed(() => {
      if (!searchQuery.value) return products.value;
      const query = searchQuery.value.toLowerCase();
      return products.value.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });

    const loadProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          products.value = data.map((product: any) => ({
            ...product,
            id: product.productId
          }));
          console.log('✅ Produits chargés pour newsletter:', products.value.length);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        showError('Erreur de chargement', 'Impossible de charger les produits');
      }
    };

    const loadRecipientCount = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/newsletter-subscribers-count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          recipientCount.value = data.count || 0;
        }
      } catch (error) {
        console.error('Erreur lors du chargement du nombre de destinataires:', error);
        // Valeur par défaut
        recipientCount.value = 0;
      }
    };

    const toggleProduct = (product: Product) => {
      const index = selectedProductIds.value.indexOf(product.id);
      if (index > -1) {
        selectedProductIds.value.splice(index, 1);
      } else {
        selectedProductIds.value.push(product.id);
      }
      // Réinitialiser la prévisualisation quand on change la sélection
      previewData.value = null;
    };

    const removeProduct = (productId: number) => {
      const index = selectedProductIds.value.indexOf(productId);
      if (index > -1) {
        selectedProductIds.value.splice(index, 1);
        previewData.value = null;
      }
    };

    const getProductName = (productId: number) => {
      const product = products.value.find(p => p.id === productId);
      return product?.name || 'Produit inconnu';
    };

    const previewNewsletter = async () => {
      if (selectedProductIds.value.length === 0) return;

      isLoading.value = true;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/alerts/preview-newsletter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            productIds: selectedProductIds.value,
            ...newsletterConfig.value
          })
        });

        if (response.ok) {
          previewData.value = await response.json();
          showSuccess('Prévisualisation générée', 'La newsletter est prête à être envoyée');
        } else {
          const error = await response.json();
          showError('Erreur de prévisualisation', error.error || 'Impossible de générer la prévisualisation');
        }
      } catch (error) {
        console.error('Erreur lors de la prévisualisation:', error);
        showError('Erreur de prévisualisation', 'Une erreur est survenue lors de la génération');
      } finally {
        isLoading.value = false;
      }
    };

    const sendNewsletter = async () => {
      if (selectedProductIds.value.length === 0 || !previewData.value) return;

      // Afficher une notification d'information pour la confirmation
      showInfo(
        'Confirmation d\'envoi', 
        `Vous allez envoyer la newsletter à ${previewData.value.recipientCount} utilisateur(s). L'envoi va commencer...`
      );

      isSending.value = true;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/alerts/send-newsletter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            productIds: selectedProductIds.value,
            ...newsletterConfig.value
          })
        });

        if (response.ok) {
          const result = await response.json();
          const sentCount = result.message.match(/\d+/)?.[0] || 'plusieurs';
          showSuccess(
            'Newsletter envoyée avec succès !', 
            `La newsletter a été envoyée à ${sentCount} utilisateur(s)`
          );
          
          // Réinitialiser le formulaire
          selectedProductIds.value = [];
          previewData.value = null;
        } else {
          const error = await response.json();
          showError('Erreur d\'envoi', error.error || 'Impossible d\'envoyer la newsletter');
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        showError('Erreur d\'envoi', 'Une erreur est survenue lors de l\'envoi de la newsletter');
      } finally {
        isSending.value = false;
      }
    };

    onMounted(() => {
      loadProducts();
      loadRecipientCount();
    });

    return {
      products,
      selectedProductIds,
      searchQuery,
      isLoading,
      isSending,
      previewData,
      recipientCount,
      newsletterConfig,
      filteredProducts,
      toggleProduct,
      removeProduct,
      getProductName,
      previewNewsletter,
      sendNewsletter
    };
  }
});
</script>

<style scoped>
.newsletter-preview {
  background: #f8fafc;
  padding: 20px;
}

.newsletter-preview * {
  max-width: 100% !important;
  box-sizing: border-box;
}
</style> 