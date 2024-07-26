<template>
    <div class="data-table">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
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
            <th v-for="column in columns" :key="column.key" class="px-6 py-3">
              <input
                type="text"
                v-model="searchQueries[column.key]"
                @input="searchColumnData"
                placeholder="Rechercher"
                class="mt-1 px-3 py-2 text-sm text-gray-600 border rounded-md"
              />
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="row in paginatedData" :key="row.productId">
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
      const sortKey = ref<string>('');
      const sortOrder = ref<string>('asc');
      const searchQueries = ref<Record<string, string>>({});
      const currentPage = ref<number>(1);
      const itemsPerPage = ref<number>(10);
  
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
  
      return {
        sortKey,
        sortOrder,
        searchQueries,
        currentPage,
        itemsPerPage,
        toggleSortColumn,
        searchColumnData,
        filteredAndSortedData,
        paginatedData,
        totalPages,
        nextPage,
        prevPage,
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
  