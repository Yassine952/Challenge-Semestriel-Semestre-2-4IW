<template>
    <div>
      <h1>Mes Commandes</h1>
      <ul v-if="orders.length > 0">
        <li v-for="order in orders" :key="order.id">
          Commande #{{ order.id }} - {{ order.totalAmount }} USD - {{ order.status }}
          <button @click="downloadInvoice(order.id)">Télécharger la facture</button>
        </li>
      </ul>
      <p v-else>Aucune commande trouvée.</p>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { fetchOrders, downloadInvoice } from '../services/orderService';
  
  export default defineComponent({
    name: 'OrderList',
    setup() {
      const orders = ref<any[]>([]);
  
      const loadOrders = async () => {
        orders.value = await fetchOrders();
      };
  
      const downloadInvoice = async (orderId: number) => {
        await downloadInvoice(orderId);
      };
  
      onMounted(loadOrders);
  
      return {
        orders,
        downloadInvoice,
      };
    },
  });
  </script>
  