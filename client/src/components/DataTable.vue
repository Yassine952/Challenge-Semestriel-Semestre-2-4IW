<template>
    <div class="data-table">
      <!-- Boutons d'actions -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex space-x-2">
          <button
            @click="exportToCSV"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Exporter CSV</span>
          </button>
          
          <button
            @click="toggleSelectAll"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {{ allSelected ? 'Désélectionner tout' : 'Sélectionner tout' }}
          </button>
        </div>
        
        <div class="text-sm text-gray-600">
          {{ selectedRows.length }} / {{ filteredAndSortedData.length }} sélectionnés
        </div>
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <!-- Colonne de sélection -->
            <th class="px-6 py-3 text-left">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              @click="toggleSortColumn(column.key)"
            >
              <div class="flex justify-between items-center">
                <span>{{ column.label }}</span>
                <span v-if="sortKey === column.key">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </th>
          </tr>
          <tr>
            <th class="px-6 py-3"></th>
            <th v-for="column in columns" :key="column.key" class="px-6 py-3">
              <input
                type="text"
                v-model="searchQueries[column.key]"
                @input="searchColumnData"
                placeholder="Rechercher"
                class="mt-1 px-3 py-2 text-sm text-gray-600 border rounded-md w-full"
              />
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="row in paginatedData" :key="row.productId" :class="{ 'bg-blue-50': selectedRows.includes(row.productId) }">
            <!-- Checkbox de sélection -->
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                :checked="selectedRows.includes(row.productId)"
                @change="toggleRowSelection(row.productId)"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td v-for="column in columns" :key="column.key" class="px-6 py-4 whitespace-nowrap">
              {{ row[column.key] }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <router-link :to="`/edit-product/${row.productId}`" class="text-indigo-600 hover:text-indigo-400">Modifier</router-link>
              <confirm-button :delete-url="`/products/${row.productId}`" :onSuccess="loadProducts" />
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-between items-center mt-4">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-gray-200 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <span>Page {{ currentPage }} sur {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-gray-200 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import ConfirmButton from './ConfirmButton.vue';
  import { useNotifications } from '../composables/useNotifications';
  
  interface Column {
    key: string;
    label: string;
  }
  
  export default defineComponent({
    name: 'DataTable',
    components: {
      ConfirmButton,
    },
    props: {
      data: {
        type: Array,
        required: true,
      },
      columns: {
        type: Array as () => Column[],
        required: true,
      },
      loadProducts: {
        type: Function,
        required: true,
      },
    },
    setup(props) {
      const { showSuccess, showError, showWarning } = useNotifications();
      const sortKey = ref<string>('');
      const sortOrder = ref<string>('asc');
      const searchQueries = ref<Record<string, string>>({});
      const currentPage = ref<number>(1);
      const itemsPerPage = ref<number>(10);
      const selectedRows = ref<number[]>([]);
  
      const toggleSortColumn = (key: string) => {
        if (sortKey.value === key) {
          sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
          sortKey.value = key;
          sortOrder.value = 'asc';
        }
      };
  
      const searchColumnData = () => {
        currentPage.value = 1;
      };
  
      const filteredAndSortedData = computed(() => {
        let filtered = props.data;
  
        Object.keys(searchQueries.value).forEach((key) => {
          const query = searchQueries.value[key]?.toLowerCase();
          if (query) {
            filtered = filtered.filter((item) =>
              item[key]?.toString().toLowerCase().includes(query)
            );
          }
        });
  
        return filtered.sort((a, b) => {
          const aValue = a[sortKey.value];
          const bValue = b[sortKey.value];
  
          if (aValue < bValue) {
            return sortOrder.value === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortOrder.value === 'asc' ? 1 : -1;
          }
          return 0;
        });
      });
  
      const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return filteredAndSortedData.value.slice(start, end);
      });
  
      const totalPages = computed(() => Math.ceil(filteredAndSortedData.value.length / itemsPerPage.value));

      const allSelected = computed(() => {
        return filteredAndSortedData.value.length > 0 && 
               filteredAndSortedData.value.every(row => selectedRows.value.includes(row.productId));
      });
  
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

      const toggleRowSelection = (productId: number) => {
        const index = selectedRows.value.indexOf(productId);
        if (index > -1) {
          selectedRows.value.splice(index, 1);
        } else {
          selectedRows.value.push(productId);
        }
      };

      const toggleSelectAll = () => {
        if (allSelected.value) {
          selectedRows.value = [];
        } else {
          selectedRows.value = filteredAndSortedData.value.map(row => row.productId);
        }
      };

      const exportToCSV = async () => {
        try {
          // Données à exporter (sélectionnées ou toutes)
          const dataToExport = selectedRows.value.length > 0 
            ? filteredAndSortedData.value.filter(row => selectedRows.value.includes(row.productId))
            : filteredAndSortedData.value;

          if (dataToExport.length === 0) {
            showWarning('Export impossible', 'Aucune donnée à exporter');
            return;
          }

          // Créer le contenu CSV
          const headers = props.columns.map(col => col.label).join(',');
          const rows = dataToExport.map(row => 
            props.columns.map(col => {
              const value = row[col.key];
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
                suggestedName: `export_${new Date().toISOString().split('T')[0]}.csv`,
                types: [{
                  description: 'Fichiers CSV',
                  accept: { 'text/csv': ['.csv'] }
                }]
              });

              const writable = await fileHandle.createWritable();
              await writable.write(blob);
              await writable.close();

              showSuccess('Export réussi', 'Fichier CSV téléchargé avec succès');
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error('Erreur lors de l\'export:', error);
                // Fallback vers le téléchargement classique
                downloadCSVFallback(blob);
              }
            }
          } else {
            // Fallback pour les navigateurs qui ne supportent pas File System Access API
            downloadCSVFallback(blob);
          }
        } catch (error) {
          console.error('Erreur lors de l\'export CSV:', error);
          showError('Erreur d\'export', 'Impossible d\'exporter le fichier CSV');
        }
      };

      const downloadCSVFallback = (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showSuccess('Téléchargement terminé', 'Fichier CSV téléchargé avec succès');
      };
  
      return {
        sortKey,
        sortOrder,
        searchQueries,
        currentPage,
        itemsPerPage,
        selectedRows,
        toggleSortColumn,
        searchColumnData,
        filteredAndSortedData,
        paginatedData,
        totalPages,
        allSelected,
        nextPage,
        prevPage,
        toggleRowSelection,
        toggleSelectAll,
        exportToCSV,
      };
    },
  });
  </script>
  
  <style scoped>
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .data-table th, .data-table td {
    padding: 8px;
    border: 1px solid #ddd;
    text-align: left;
  }
  
  .data-table th {
    cursor: pointer;
    background-color: #f2f2f2;
  }
  
  .data-table th:hover {
    background-color: #ddd;
  }
  </style>
  