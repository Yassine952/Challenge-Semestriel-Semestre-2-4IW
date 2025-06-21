<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Mes Commandes</h1>
    
    <div v-if="orders.length > 0" class="space-y-6">
      <div v-for="order in orders" :key="order.id" class="bg-white shadow-md rounded-lg p-6 border">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold">Commande #{{ order.id }}</h3>
            <p class="text-gray-600">{{ formatDate(order.createdAt) }}</p>
            <p class="text-lg font-medium">{{ order.totalAmount }} €</p>
          </div>
          <div class="text-right">
            <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ order.status }}
            </span>
            <div v-if="order.returnRequested" class="mt-2">
              <span :class="getReturnStatusClass(order.returnStatus)" class="px-3 py-1 rounded-full text-sm">
                Retour: {{ order.returnStatus }}
              </span>
            </div>
          </div>
        </div>


        <div v-if="order.OrderItems && order.OrderItems.length > 0" class="mb-4">
          <h4 class="font-medium mb-2">Articles:</h4>
          <ul class="space-y-1">
            <li v-for="item in order.OrderItems" :key="item.id" class="text-sm text-gray-600">
              {{ item.quantity }}x {{ item.productName }} - {{ item.price }} €
            </li>
          </ul>
        </div>


        <div class="flex flex-wrap gap-3">
          <button 
            @click="downloadInvoice(order.orderId)"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            📄 Télécharger la facture
          </button>

          <button 
            v-if="canReorder(order)"
            @click="reorder(order.orderId)"
            :disabled="isReordering"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            🛒 Commander à nouveau
          </button>

          <button 
            v-if="canRequestReturn(order)"
            @click="openReturnModal(order)"
            class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            ↩️ Demander un retour
          </button>
        </div>
      </div>
    </div>

    <p v-else class="text-center text-gray-500 text-lg">Aucune commande trouvée.</p>


    <div v-if="showReturnModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-xl font-semibold mb-4">Demande de retour</h3>
        <p class="text-gray-600 mb-4">Commande #{{ selectedOrder?.orderId }}</p>
        
        <div class="mb-4">
          <label for="returnReason" class="block text-sm font-medium text-gray-700 mb-2">
            Raison du retour:
          </label>
          <textarea
            id="returnReason"
            v-model="returnReason"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Expliquez la raison de votre demande de retour..."
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            @click="closeReturnModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="submitReturn"
            :disabled="!returnReason.trim() || isSubmittingReturn"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {{ isSubmittingReturn ? 'Envoi...' : 'Confirmer le retour' }}
          </button>
        </div>
      </div>
    </div>



  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchOrders, downloadInvoice, requestReturn, reorderProducts } from '../services/orderService';
import { useNotifications } from '../composables/useNotifications';

interface Order {
  _id: string;
  orderId: number;
  createdAt: string;
  totalAmount: number;
  status: string;
  returnRequested: boolean;
  returnStatus: string | null;
  OrderItems?: Array<{
    id: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default defineComponent({
  name: 'OrderList',
  setup() {
    const { showSuccess, showError } = useNotifications();
    const orders = ref<Order[]>([]);
    const showReturnModal = ref(false);
    const selectedOrder = ref<Order | null>(null);
    const returnReason = ref('');
    const isSubmittingReturn = ref(false);
    const isReordering = ref(false);

    const loadOrders = async () => {
      try {
        orders.value = await fetchOrders();
      } catch (error) {
        showError('Erreur', 'Impossible de charger les commandes');
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getStatusClass = (status: string) => {
      const classes = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Completed': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800'
      };
      return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
    };

    const getReturnStatusClass = (status: string | null) => {
      const classes = {
        'Requested': 'bg-orange-100 text-orange-800',
        'Approved': 'bg-blue-100 text-blue-800',
        'Denied': 'bg-red-100 text-red-800',
        'Processed': 'bg-green-100 text-green-800'
      };
      return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
    };

    const canRequestReturn = (order: Order) => {
      if (order.status !== 'Completed' || order.returnRequested) return false;
      
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysDiff <= 30;
    };

    const canReorder = (order: Order) => {
      return order.status === 'Completed';
    };

    const openReturnModal = (order: Order) => {
      selectedOrder.value = order;
      returnReason.value = '';
      showReturnModal.value = true;
    };

    const closeReturnModal = () => {
      showReturnModal.value = false;
      selectedOrder.value = null;
      returnReason.value = '';
    };

    const submitReturn = async () => {
      if (!selectedOrder.value || !returnReason.value.trim()) return;
      
      isSubmittingReturn.value = true;
      try {
        await requestReturn(selectedOrder.value.orderId, returnReason.value);
        showSuccess('Demande de retour', 'Votre demande de retour a été soumise avec succès');
        closeReturnModal();
        loadOrders();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error || 'Erreur lors de la demande de retour');
      } finally {
        isSubmittingReturn.value = false;
      }
    };

    const reorder = async (orderId: number) => {
      isReordering.value = true;
      try {
        const result = await reorderProducts(orderId);
        
        let message = 'Produits ajoutés au panier avec succès!';
        if (result.unavailableProducts && result.unavailableProducts.length > 0) {
          message += ` Attention: ${result.unavailableProducts.length} produit(s) non disponible(s).`;
        }
        
        showSuccess('Commander à nouveau', message);
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error || 'Erreur lors de la re-commande');
      } finally {
        isReordering.value = false;
      }
    };

    onMounted(loadOrders);

    return {
      orders,
      showReturnModal,
      selectedOrder,
      returnReason,
      isSubmittingReturn,
      isReordering,
      downloadInvoice,
      formatDate,
      getStatusClass,
      getReturnStatusClass,
      canRequestReturn,
      canReorder,
      openReturnModal,
      closeReturnModal,
      submitReturn,
      reorder
    };
  },
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
  