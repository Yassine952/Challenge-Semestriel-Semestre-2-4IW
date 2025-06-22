<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
            <p class="text-gray-600 mt-1">Gérez votre catalogue de produits</p>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {{ products?.length || 0 }} produit(s)
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Actions Bar -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 mb-8">
        <div class="p-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <!-- Actions principales -->
            <div class="flex flex-wrap items-center gap-3">
              <router-link 
                to="/add-product" 
                class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-md"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Ajouter un produit</span>
              </router-link>
              
              <button
                @click="exportToCSV"
                class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-md"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Exporter CSV</span>
              </button>
              
              <button
                @click="toggleSelectAll"
                class="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-md"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ allSelected ? 'Désélectionner tout' : 'Sélectionner tout' }}</span>
              </button>
              
              <button
                v-if="selectedProducts.length > 0"
                @click="deleteSelected"
                class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-md"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Supprimer ({{ selectedProducts.length }})</span>
              </button>
            </div>
            
            <!-- Stats et pagination -->
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <div class="flex items-center space-x-2">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {{ selectionCounter }} sélectionnés
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <button 
                  @click="prevPage" 
                  :disabled="currentPage === 1" 
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span class="px-3 py-1 bg-gray-100 rounded-lg">
                  {{ currentPage }} / {{ totalPages }}
                </span>
                <button 
                  @click="nextPage" 
                  :disabled="currentPage === totalPages" 
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message de chargement -->
      <div v-if="!products || products.length === 0" class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-12 text-center">
        <div v-if="products === null" class="space-y-4">
          <div class="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p class="text-gray-600 text-lg">Chargement des produits...</p>
        </div>
        <div v-else class="space-y-4">
          <svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <div>
            <p class="text-gray-600 text-lg mb-2">Aucun produit trouvé</p>
            <p class="text-gray-400 text-sm">Ajoutez votre premier produit en cliquant sur "Ajouter un produit"</p>
          </div>
        </div>
      </div>

      <!-- Table des produits -->
      <div v-else class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <!-- Filtres en haut -->
        <div class="px-6 py-4 border-b border-gray-200/50 bg-blue-50/30">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <input 
              type="text" 
              v-model="filters.name" 
              @input="filterData" 
              placeholder="Rechercher par nom..." 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
            <input 
              type="text" 
              v-model="filters.description" 
              @input="filterData" 
              placeholder="Rechercher par description..." 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
            <input 
              type="text" 
              v-model="filters.price" 
              @input="filterData" 
              placeholder="Rechercher par prix (€)..." 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
            <input 
              type="number" 
              v-model="filters.stock" 
              @input="filterData" 
              placeholder="Rechercher par stock..." 
              min="0"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
            <input 
              type="text" 
              v-model="filters.category" 
              @input="filterData" 
              placeholder="Rechercher par catégorie..." 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
            <select 
              v-model="filters.onSale" 
              @change="filterData" 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Tous les produits</option>
              <option value="true">En vente</option>
              <option value="false">Hors vente</option>
            </select>
          </div>
        </div>

        <!-- Tableau véritable -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <!-- En-tête du tableau -->
            <thead class="bg-gray-50/50 border-b border-gray-200/50">
              <tr>
                <th class="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    @change="toggleSelectAll"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </th>
                <th 
                  class="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                  @click="sortColumn('name')"
                >
                  <div class="flex items-center space-x-1">
                    <span>Nom</span>
                    <svg v-if="sortKey === 'name'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                    </svg>
                  </div>
                </th>
                <th 
                  class="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                  @click="sortColumn('description')"
                >
                  <div class="flex items-center space-x-1">
                    <span>Description</span>
                    <svg v-if="sortKey === 'description'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                    </svg>
                  </div>
                </th>
                <th 
                  class="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                  @click="sortColumn('price')"
                >
                  <div class="flex items-center space-x-1">
                    <span>Prix</span>
                    <svg v-if="sortKey === 'price'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                    </svg>
                  </div>
                </th>
                <th 
                  class="px-4 py-3 text-center text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                  @click="sortColumn('stock')"
                >
                  <div class="flex items-center justify-center space-x-1">
                    <span>Stock</span>
                    <svg v-if="sortKey === 'stock'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                    </svg>
                  </div>
                </th>
                <th 
                  class="px-4 py-3 text-center text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                  @click="sortColumn('category')"
                >
                  <div class="flex items-center justify-center space-x-1">
                    <span>Catégorie</span>
                    <svg v-if="sortKey === 'category'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                    </svg>
                  </div>
                </th>
                <th 
                  class="px-4 py-3 text-center text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                  @click="sortColumn('onSale')"
                >
                  <div class="flex items-center justify-center space-x-1">
                    <span>En Vente</span>
                    <svg v-if="sortKey === 'onSale'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                    </svg>
                  </div>
                </th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>

            <!-- Corps du tableau -->
            <tbody class="divide-y divide-gray-200/50">
              <tr 
                v-for="product in paginatedData" 
                :key="product.productId"
                class="hover:bg-blue-50/30 transition-colors"
                :class="{ 'bg-blue-50/50': selectedProducts.includes(product.productId) }"
              >
                <!-- Checkbox -->
                <td class="px-4 py-4">
                  <input
                    type="checkbox"
                    :checked="selectedProducts.includes(product.productId)"
                    @change="toggleProductSelection(product.productId)"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </td>
                
                <!-- Nom -->
                <td class="px-4 py-4">
                  <div class="font-medium text-gray-900">
                    {{ product.name }}
                  </div>
                </td>
                
                <!-- Description -->
                <td class="px-4 py-4">
                  <div class="text-gray-600 text-sm max-w-xs truncate" :title="product.description">
                    {{ product.description }}
                  </div>
                </td>
                
                <!-- Prix -->
                <td class="px-4 py-4">
                  <div class="font-semibold text-green-600">
                    {{ (product.price / 100).toFixed(2) }} €
                  </div>
                </td>
                
                <!-- Stock -->
                <td class="px-4 py-4 text-center">
                  <span 
                    class="px-2 py-1 text-xs rounded-full font-medium"
                    :class="product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ product.stock }}
                  </span>
                </td>
                
                <!-- Catégorie -->
                <td class="px-4 py-4 text-center">
                  <span class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full font-medium">
                    {{ product.category }}
                  </span>
                </td>
                
                <!-- En Vente -->
                <td class="px-4 py-4 text-center">
                  <span 
                    class="px-2 py-1 text-xs rounded-full font-medium"
                    :class="product.onSale ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ product.onSale ? 'Oui' : 'Non' }}
                  </span>
                </td>
                
                <!-- Actions -->
                <td class="px-4 py-4">
                  <div class="flex items-center justify-center space-x-2">
                    <router-link 
                      :to="`/edit-product/${product.productId}`" 
                      class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Modifier le produit"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </router-link>
                    <button 
                      @click="deleteProduct(product.productId)"
                      class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer le produit"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation pour suppression multiple -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
          <p class="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer {{ selectedProducts.length }} produit(s) sélectionné(s) ?
            <br><span class="text-red-600 font-medium">Cette action est irréversible.</span>
          </p>
          <div class="flex justify-center space-x-4">
            <button 
              @click="showDeleteModal = false"
              class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              @click="confirmDeleteSelected"
              :disabled="isDeleting"
              class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <svg v-if="isDeleting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isDeleting ? 'Suppression...' : 'Supprimer' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation pour suppression individuelle -->
    <div v-if="showSingleDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
          <p class="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer ce produit ?
            <br><span class="text-red-600 font-medium">Cette action est irréversible.</span>
          </p>
          <div class="flex justify-center space-x-4">
            <button 
              @click="showSingleDeleteModal = false"
              class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              @click="confirmDeleteProduct"
              :disabled="isDeleting"
              class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <svg v-if="isDeleting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isDeleting ? 'Suppression...' : 'Supprimer' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { fetchProducts } from '../services/productService';
import { Product } from '../types/Product';
import ConfirmButton from '../components/ConfirmButton.vue';
import { useNotifications } from '../composables/useNotifications';

export default defineComponent({
  name: 'ProductList',
  components: {
    ConfirmButton,
  },
  setup() {
    const { showSuccess, showError, showWarning } = useNotifications();
    const products = ref<Product[]>([]);
    const filters = ref({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      onSale: ''
    });
    const sortKey = ref<string>('');
    const sortOrder = ref<string>('asc');
    const currentPage = ref<number>(1);
    const itemsPerPage = 5;
    const selectedProducts = ref<number[]>([]);
    const allSelected = ref<boolean>(false);
    const showDeleteModal = ref<boolean>(false);
    const isDeleting = ref<boolean>(false);
    const showSingleDeleteModal = ref<boolean>(false);
    const productToDelete = ref<number | null>(null);

    const sortedData = computed(() => {
      if (!products.value || products.value.length === 0) {
        return [];
      }
      return [...products.value].sort((a, b) => {
        let result = 0;
        if (a[sortKey.value] < b[sortKey.value]) {
          result = -1;
        } else if (a[sortKey.value] > b[sortKey.value]) {
          result = 1;
        }
        return sortOrder.value === 'asc' ? result : -result;
      });
    });

    const filteredData = computed(() => {
      if (!products.value || products.value.length === 0) {
        return [];
      }
      return sortedData.value.filter(product => {
        // Filtrage par nom
        if (filters.value.name && !product.name.toLowerCase().includes(filters.value.name.toLowerCase())) {
          return false;
        }
        
        // Filtrage par description
        if (filters.value.description && !product.description.toLowerCase().includes(filters.value.description.toLowerCase())) {
          return false;
        }
        
        // Filtrage par prix (conversion en euros pour la recherche)
        if (filters.value.price) {
          const productPriceInEuros = (product.price / 100).toFixed(2);
          if (!productPriceInEuros.includes(filters.value.price)) {
            return false;
          }
        }
        
        // Filtrage par stock
        if (filters.value.stock) {
          const stockFilter = filters.value.stock.toString();
          if (!product.stock.toString().includes(stockFilter)) {
            return false;
          }
        }
        
        // Filtrage par catégorie
        if (filters.value.category && !product.category.toLowerCase().includes(filters.value.category.toLowerCase())) {
          return false;
        }
        
        // Filtrage par statut de vente
        if (filters.value.onSale) {
          const isOnSale = filters.value.onSale === 'true';
          if (product.onSale !== isOnSale) {
            return false;
          }
        }
        
        return true;
      });
    });

    const paginatedData = computed(() => {
      if (!filteredData.value || filteredData.value.length === 0) {
        return [];
      }
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredData.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return (filteredData.value && filteredData.value.length > 0) ? Math.ceil(filteredData.value.length / itemsPerPage) : 1;
    });

    // Computed pour l'affichage du compteur de sélection
    const selectionCounter = computed(() => {
      const totalVisible = filteredData.value ? filteredData.value.length : 0;
      return `${selectedProducts.value.length} / ${totalVisible}`;
    });

    const loadProducts = async () => {
      try {
        console.log('Chargement des produits...');
        const fetchedProducts = await fetchProducts();
        console.log('Produits récupérés:', fetchedProducts);
        products.value = Array.isArray(fetchedProducts) ? fetchedProducts : [];
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        products.value = [];
      }
    };

    const sortColumn = (key: string) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
    };

    const filterData = () => {
      currentPage.value = 1;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value += 1;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value -= 1;
      }
    };

    const toggleSelectAll = () => {
      allSelected.value = !allSelected.value;
      selectedProducts.value = allSelected.value ? filteredData.value.map(product => product.productId) : [];
    };

    const toggleProductSelection = (productId: number) => {
      if (selectedProducts.value.includes(productId)) {
        selectedProducts.value = selectedProducts.value.filter(id => id !== productId);
      } else {
        selectedProducts.value.push(productId);
      }
      
      // Mettre à jour l'état "Sélectionner tout"
      allSelected.value = selectedProducts.value.length === filteredData.value.length && filteredData.value.length > 0;
    };

    // Computed pour vérifier si tous les produits visibles sont sélectionnés
    const allVisibleSelected = computed(() => {
      return filteredData.value.length > 0 && 
             filteredData.value.every(product => selectedProducts.value.includes(product.productId));
    });

    // Watcher pour synchroniser allSelected avec allVisibleSelected
    watch(allVisibleSelected, (newValue) => {
      allSelected.value = newValue;
    });

    // Watcher pour réinitialiser la sélection quand les filtres changent
    watch(filteredData, () => {
      // Garder seulement les produits sélectionnés qui sont encore visibles
      selectedProducts.value = selectedProducts.value.filter(id => 
        filteredData.value.some(product => product.productId === id)
      );
    });

    const exportToCSV = async () => {
      try {
        // Données à exporter (sélectionnées ou toutes si aucune sélection)
        const dataToExport = selectedProducts.value.length > 0 
          ? filteredData.value.filter(product => selectedProducts.value.includes(product.productId))
          : filteredData.value;

        if (dataToExport.length === 0) {
          showWarning('Export impossible', 'Aucune donnée à exporter');
          return;
        }

        // Définir les colonnes à exporter
        const columns = [
          { key: 'name', label: 'Nom' },
          { key: 'description', label: 'Description' },
          { key: 'price', label: 'Prix (€)' },
          { key: 'stock', label: 'Stock' },
          { key: 'category', label: 'Catégorie' },
          { key: 'onSale', label: 'En Vente' }
        ];

        // Créer le contenu CSV
        const headers = columns.map(col => col.label).join(',');
        const rows = dataToExport.map(product => 
          columns.map(col => {
            let value;
            if (col.key === 'price') {
              value = (product.price / 100).toFixed(2); // Convertir centimes en euros
            } else if (col.key === 'onSale') {
              value = product.onSale ? 'Oui' : 'Non';
            } else {
              value = product[col.key] || '';
            }
            
            // Échapper les guillemets et entourer de guillemets si nécessaire
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        );
        
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Utiliser File System Access API si disponible
        if ('showSaveFilePicker' in window) {
          try {
            const fileHandle = await (window as any).showSaveFilePicker({
              suggestedName: `produits_export_${new Date().toISOString().split('T')[0]}.csv`,
              types: [{
                description: 'Fichiers CSV',
                accept: { 'text/csv': ['.csv'] }
              }]
            });

            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            showSuccess('Export réussi', `${dataToExport.length} produit(s) exporté(s)`);
          } catch (error: any) {
            if (error.name !== 'AbortError') {
              console.error('Erreur lors de l\'export:', error);
              // Fallback vers le téléchargement classique
              downloadCSVFallback(blob, dataToExport.length);
            }
          }
        } else {
          // Fallback pour les navigateurs qui ne supportent pas File System Access API
          downloadCSVFallback(blob, dataToExport.length);
        }
      } catch (error) {
        console.error('Erreur lors de l\'export CSV:', error);
        showError('Erreur d\'export', 'Impossible d\'exporter le fichier CSV');
      }
    };

    const downloadCSVFallback = (blob: Blob, count: number) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `produits_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Téléchargement terminé', `${count} produit(s) exporté(s)`);
    };

    const deleteSelected = async () => {
      showDeleteModal.value = true;
    };

    const confirmDeleteSelected = async () => {
      isDeleting.value = true;
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('token');
        
        // Supprimer chaque produit individuellement
        const deletePromises = selectedProducts.value.map(productId => 
          fetch(`${apiUrl}/products/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        );
        
        await Promise.all(deletePromises);
        
        // Réinitialiser la sélection et recharger les données
        selectedProducts.value = [];
        allSelected.value = false;
        await loadProducts();
        
        showSuccess('Suppression réussie', 'Les produits sélectionnés ont été supprimés');
      } catch (error) {
        console.error('Erreur lors de la suppression des produits:', error);
        showError('Erreur de suppression', 'Impossible de supprimer les produits');
      } finally {
        showDeleteModal.value = false;
        isDeleting.value = false;
      }
    };

    const deleteProduct = (productId: number) => {
      productToDelete.value = productId;
      showSingleDeleteModal.value = true;
    };

    const confirmDeleteProduct = async () => {
      if (!productToDelete.value) return;
      
      isDeleting.value = true;
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('token');
        
        await fetch(`${apiUrl}/products/${productToDelete.value}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        await loadProducts();
        showSuccess('Suppression réussie', 'Le produit a été supprimé');
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        showError('Erreur de suppression', 'Impossible de supprimer le produit');
      } finally {
        showSingleDeleteModal.value = false;
        productToDelete.value = null;
        isDeleting.value = false;
      }
    };

    onMounted(loadProducts);

    return {
      products,
      filters,
      sortKey,
      sortOrder,
      currentPage,
      totalPages,
      paginatedData,
      filteredData,
      selectionCounter,
      loadProducts,
      sortColumn,
      filterData,
      nextPage,
      prevPage,
      selectedProducts,
      allSelected,
      showDeleteModal,
      isDeleting,
      toggleSelectAll,
      toggleProductSelection,
      exportToCSV,
      deleteSelected,
      confirmDeleteSelected,
      deleteProduct,
      confirmDeleteProduct,
      showSingleDeleteModal,
      productToDelete
    };
  },
});
</script>

<style scoped>
input[type="text"] {
  transition: border-color 0.3s ease-in-out;
}

input[type="text"]:focus {
  border-color: #4f46e5;
}

button:disabled {
  cursor: not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Styles responsive pour le tableau */
@media (max-width: 1200px) {
  /* Réduction de la grille des filtres sur tablette */
  .grid.xl\\:grid-cols-6 {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 768px) {
  /* Masquer certaines colonnes sur mobile */
  table th:nth-child(3),
  table td:nth-child(3) {
    display: none;
  }
  
  /* Réduire la taille des boutons sur mobile */
  .inline-flex.items-center {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .inline-flex.items-center svg {
    width: 0.75rem;
    height: 0.75rem;
  }
  
  /* Grille des filtres en 2 colonnes */
  .grid.lg\\:grid-cols-3 {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 640px) {
  /* Masquer plus de colonnes sur très petit écran */
  table th:nth-child(6),
  table td:nth-child(6),
  table th:nth-child(7),
  table td:nth-child(7) {
    display: none;
  }
  
  /* Affichage en mode compact */
  .inline-flex.items-center {
    padding: 0.25rem;
    font-size: 0;
  }
  
  .inline-flex.items-center svg {
    width: 1rem;
    height: 1rem;
    margin: 0;
  }
  
  /* Grille des filtres en 1 colonne */
  .grid.md\\:grid-cols-2 {
    grid-template-columns: 1fr !important;
  }
}
</style>
