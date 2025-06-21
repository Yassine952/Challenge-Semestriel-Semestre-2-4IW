<template>
  <div class="alerts-manager bg-white shadow-md rounded-lg p-6">
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">🔔 Gestion des Alertes</h2>
    
    <!-- Vérification des stocks faibles -->
    <div class="mb-8">
      <h3 class="text-lg font-medium mb-4 text-gray-700">Alertes de Stock</h3>
      <div class="flex items-center space-x-4">
        <button
          @click="checkLowStock"
          :disabled="isCheckingStock"
          class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          <svg v-if="isCheckingStock" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isCheckingStock ? 'Vérification...' : 'Vérifier les stocks faibles' }}</span>
        </button>
        
        <div v-if="lowStockResult" class="text-sm">
          <span :class="lowStockResult.count > 0 ? 'text-orange-600' : 'text-green-600'">
            {{ lowStockResult.count }} produit(s) en stock faible
          </span>
        </div>
      </div>
      
      <!-- Liste des produits en stock faible -->
      <div v-if="lowStockResult && lowStockResult.products.length > 0" class="mt-4">
        <h4 class="font-medium text-gray-700 mb-2">Produits concernés :</h4>
        <div class="bg-orange-50 border border-orange-200 rounded-md p-3">
          <ul class="space-y-1">
            <li v-for="product in lowStockResult.products" :key="product.id" class="text-sm text-orange-800">
              <strong>{{ product.name }}</strong> - Stock: {{ product.stock }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Newsletter -->
    <div class="mb-8">
      <h3 class="text-lg font-medium mb-4 text-gray-700">Newsletter</h3>
      <div class="space-y-4">
        <!-- Sélection des produits -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner les produits pour la newsletter :
          </label>
          <div class="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
            <div v-for="product in products" :key="product.id" class="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                :id="`product-${product.id}`"
                v-model="selectedProducts"
                :value="product.id"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label :for="`product-${product.id}`" class="text-sm text-gray-700">
                {{ product.name }} - {{ (product.price / 100).toFixed(2) }}€
              </label>
            </div>
          </div>
        </div>
        
        <button
          @click="sendNewsletter"
          :disabled="selectedProducts.length === 0 || isSendingNewsletter"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          <svg v-if="isSendingNewsletter" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isSendingNewsletter ? 'Envoi...' : `Envoyer newsletter (${selectedProducts.length} produits)` }}</span>
        </button>
      </div>
    </div>

    <!-- Configuration des alertes -->
    <div class="mb-8">
      <h3 class="text-lg font-medium mb-4 text-gray-700">Configuration</h3>
      <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Seuil de stock faible
            </label>
            <div class="flex space-x-2">
              <input
                type="number"
                v-model="stockThreshold"
                min="1"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                @click="saveStockThreshold"
                class="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                ✅ Sauvegarder
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Alertes envoyées quand le stock ≤ cette valeur
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email SMTP configuré
            </label>
            <div class="flex items-center space-x-2">
              <div :class="smtpConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                   class="px-2 py-1 rounded-full text-xs font-medium">
                {{ smtpConfigured ? '✅ Configuré' : '❌ Non configuré' }}
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Vérifiez les variables SMTP_* dans .env
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages de statut -->
    <div v-if="message" :class="messageClass" class="p-4 rounded-md mb-4">
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { fetchProducts } from '../services/productService';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface LowStockResult {
  count: number;
  products: Array<{
    id: number;
    name: string;
    stock: number;
  }>;
}

export default defineComponent({
  name: 'AlertsManager',
  setup() {
    const products = ref<Product[]>([]);
    const selectedProducts = ref<number[]>([]);
    // ✅ Récupérer la valeur depuis localStorage ou utiliser 10 par défaut
    const stockThreshold = ref(parseInt(localStorage.getItem('stockThreshold') || '10'));
    const smtpConfigured = ref(true); // À vérifier côté serveur
    
    const isCheckingStock = ref(false);
    const isSendingNewsletter = ref(false);
    const lowStockResult = ref<LowStockResult | null>(null);
    
    const message = ref('');
    const messageClass = ref('');

    const loadProducts = async () => {
      try {
        const allProducts = await fetchProducts();
        products.value = allProducts.map(p => ({
          id: p.productId,
          name: p.name,
          price: p.price,
          stock: p.stock
        }));
      } catch (error) {
        showMessage('Erreur lors du chargement des produits', 'error');
      }
    };

    // ✅ Charger le seuil depuis le serveur
    const loadStockThreshold = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/alerts/stock-threshold`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          stockThreshold.value = data.threshold;
          // Synchroniser avec localStorage
          localStorage.setItem('stockThreshold', data.threshold.toString());
          console.log(`📊 Seuil de stock récupéré: ${data.threshold}`);
        }
      } catch (error) {
        console.warn('⚠️ Impossible de récupérer le seuil depuis le serveur, utilisation de la valeur locale');
      }
    };

    const checkLowStock = async () => {
      isCheckingStock.value = true;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/alerts/check-low-stock?threshold=${stockThreshold.value}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la vérification des stocks');
        }

        const data = await response.json();
        lowStockResult.value = {
          count: data.lowStockProducts.length,
          products: data.lowStockProducts
        };

        showMessage(data.message, 'success');
      } catch (error: any) {
        showMessage(error.message || 'Erreur lors de la vérification des stocks', 'error');
      } finally {
        isCheckingStock.value = false;
      }
    };

    const sendNewsletter = async () => {
      if (selectedProducts.value.length === 0) return;

      isSendingNewsletter.value = true;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/alerts/send-newsletter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            productIds: selectedProducts.value
          })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'envoi de la newsletter');
        }

        const data = await response.json();
        showMessage(data.message, 'success');
        selectedProducts.value = [];
      } catch (error: any) {
        showMessage(error.message || 'Erreur lors de l\'envoi de la newsletter', 'error');
      } finally {
        isSendingNewsletter.value = false;
      }
    };

    const showMessage = (msg: string, type: 'success' | 'error') => {
      message.value = msg;
      messageClass.value = type === 'success' 
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-red-100 text-red-800 border border-red-200';
      
      setTimeout(() => {
        message.value = '';
      }, 5000);
    };

    // ✅ Sauvegarder le seuil dans localStorage ET sur le serveur
    const saveStockThreshold = async () => {
      try {
        // Sauvegarder sur le serveur
        const response = await fetch(`${import.meta.env.VITE_API_URL}/alerts/stock-threshold`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ threshold: stockThreshold.value })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde du seuil');
        }

        const data = await response.json();
        
        // Sauvegarder aussi en local
        localStorage.setItem('stockThreshold', stockThreshold.value.toString());
        
        showMessage(`✅ ${data.message}`, 'success');
      } catch (error: any) {
        showMessage(`❌ Erreur: ${error.message}`, 'error');
      }
    };

    // ✅ Sauvegarder automatiquement quand la valeur change (avec délai)
    let saveTimeout: NodeJS.Timeout | null = null;
    watch(stockThreshold, (newValue) => {
      // Sauvegarder automatiquement dans localStorage (sans message)
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        localStorage.setItem('stockThreshold', newValue.toString());
      }, 1000); // Attendre 1 seconde après le dernier changement
    });

    onMounted(() => {
      loadProducts();
      loadStockThreshold();
    });

    return {
      products,
      selectedProducts,
      stockThreshold,
      smtpConfigured,
      isCheckingStock,
      isSendingNewsletter,
      lowStockResult,
      message,
      messageClass,
      checkLowStock,
      sendNewsletter,
      saveStockThreshold
    };
  }
});
</script>

<style scoped>
.alerts-manager {
  max-width: 800px;
}
</style> 