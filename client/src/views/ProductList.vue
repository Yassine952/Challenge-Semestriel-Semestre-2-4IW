<template>
  <div class="max-w-screen-xl mx-auto px-4 md:px-8 py-10">
    <div class="max-w-lg sm:mx-auto sm:text-center mb-8">
      <h3 class="text-gray-800 text-4xl font-semibold sm:text-5xl mb-2">
        Liste des produits
      </h3>
      <p class="leading-relaxed text-gray-600 text-[15px]">
        Découvrez notre collection de produits.
      </p>
    </div>
    <div class="flex justify-between items-center mb-4">
      <router-link to="/add-product" class="text-indigo-600 duration-150 hover:text-indigo-400 font-medium inline-flex items-center gap-x-1">
        Ajouter un produit
      </router-link>
      <div class="flex items-center space-x-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded disabled:opacity-50">
          Précédent
        </button>
        <span>Page {{ currentPage }} sur {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded disabled:opacity-50">
          Suivant
        </button>
      </div>
    </div>
    <div class="shadow-sm border rounded-lg overflow-x-auto">
      <table class="w-full table-auto text-sm text-left">
        <thead class="bg-gray-50 text-gray-600 font-medium border-b">
          <tr>
            <th class="py-3 px-6 cursor-pointer" @click="sortColumn('name')">
              Nom <span v-if="sortKey === 'name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3 px-6 cursor-pointer" @click="sortColumn('description')">
              Description <span v-if="sortKey === 'description'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3 px-6 cursor-pointer" @click="sortColumn('price')">
              Prix <span v-if="sortKey === 'price'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3 px-6 cursor-pointer" @click="sortColumn('stock')">
              Stock <span v-if="sortKey === 'stock'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3 px-6 cursor-pointer" @click="sortColumn('category')">
              Catégorie <span v-if="sortKey === 'category'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3 px-6 cursor-pointer" @click="sortColumn('onSale')">
              En Vente <span v-if="sortKey === 'onSale'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3 px-6">Actions</th>
          </tr>
          <tr>
            <th class="py-2 px-6"><input type="text" v-model="filters.name" @input="filterData" placeholder="Rechercher" class="w-full px-2 py-1 border rounded"></th>
            <th class="py-2 px-6"><input type="text" v-model="filters.description" @input="filterData" placeholder="Rechercher" class="w-full px-2 py-1 border rounded"></th>
            <th class="py-2 px-6"><input type="text" v-model="filters.price" @input="filterData" placeholder="Rechercher" class="w-full px-2 py-1 border rounded"></th>
            <th class="py-2 px-6"><input type="text" v-model="filters.stock" @input="filterData" placeholder="Rechercher" class="w-full px-2 py-1 border rounded"></th>
            <th class="py-2 px-6"><input type="text" v-model="filters.category" @input="filterData" placeholder="Rechercher" class="w-full px-2 py-1 border rounded"></th>
            <th class="py-2 px-6"><input type="text" v-model="filters.onSale" @input="filterData" placeholder="Rechercher" class="w-full px-2 py-1 border rounded"></th>
            <th class="py-2 px-6"></th>
          </tr>
        </thead>
        <tbody class="text-gray-600 divide-y">
          <tr v-for="product in paginatedData" :key="product.productId">
            <td class="px-6 py-4 whitespace-nowrap">{{ product.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.description }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.price }} €</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.stock }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.category }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.onSale ? 'Oui' : 'Non' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <router-link :to="`/edit-product/${product.productId}`" class="text-indigo-600 hover:text-indigo-400">Modifier</router-link>
              <confirm-button :delete-url="`/api/products/${product.productId}`" :onSuccess="loadProducts" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { fetchProducts } from '../services/productService';
import { Product } from '../types/Product';
import ConfirmButton from '../components/ConfirmButton.vue';

export default defineComponent({
  name: 'ProductList',
  components: {
    ConfirmButton,
  },
  setup() {
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

    const sortedData = computed(() => {
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
      return sortedData.value.filter(product => {
        return Object.keys(filters.value).every(key => {
          return String(product[key as keyof Product]).toLowerCase().includes(filters.value[key as keyof typeof filters.value].toLowerCase());
        });
      });
    });

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredData.value.slice(start, end);
    });

    const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage));

    const loadProducts = async () => {
      products.value = await fetchProducts();
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

    onMounted(loadProducts);

    return {
      products,
      filters,
      sortKey,
      sortOrder,
      currentPage,
      totalPages,
      paginatedData,
      loadProducts,
      sortColumn,
      filterData,
      nextPage,
      prevPage
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
</style>
