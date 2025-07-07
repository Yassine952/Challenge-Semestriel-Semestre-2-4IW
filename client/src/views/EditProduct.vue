<template>
  <main class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- En-tête -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Modifier le produit
        </h1>
        <p class="text-gray-600">
          Modifiez les informations de votre produit
        </p>
      </div>

      <!-- Formulaire -->
      <div class="bg-white shadow-lg rounded-lg p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6" v-if="product">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Nom du produit</label>
            <input
              type="text"
              v-model="name"
              @input="handleChange('name', $event.target.value)"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez le nom du produit"
            />
            <span v-if="nameError" class="text-red-500 text-sm mt-1">{{ nameError }}</span>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="description"
              @input="handleChange('description', $event.target.value)"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez votre produit..."
            ></textarea>
            <span v-if="descriptionError" class="text-red-500 text-sm mt-1">{{ descriptionError }}</span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Image du produit</label>
            
            <!-- Image actuelle -->
            <div v-if="currentImageUrl && !imagePreview" class="mb-4">
              <p class="text-sm text-gray-600 mb-2">Image actuelle :</p>
              <div class="relative inline-block">
                <img 
                  :src="getImageUrl(currentImageUrl)" 
                  alt="Image actuelle" 
                  class="w-32 h-32 object-cover rounded-lg border shadow-sm"
                />
                <button 
                  type="button" 
                  @click="removeCurrentImage"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  title="Supprimer l'image"
                >
                  ×
                </button>
              </div>
            </div>
            
            <!-- Upload nouvelle image -->
            <div class="mb-4">
              <input
                type="file"
                id="image"
                ref="imageInput"
                @change="handleImageChange"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p class="text-xs text-gray-500 mt-1">
                Formats acceptés: JPEG, PNG, GIF, WebP (max 5MB)
              </p>
            </div>
            
            <!-- Prévisualisation nouvelle image -->
            <div v-if="imagePreview" class="mb-4">
              <p class="text-sm text-gray-600 mb-2">Nouvelle image :</p>
              <div class="relative inline-block">
                <img 
                  :src="imagePreview" 
                  alt="Aperçu" 
                  class="w-32 h-32 object-cover rounded-lg border shadow-sm"
                />
                <button 
                  type="button" 
                  @click="removeNewImage"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  title="Annuler la nouvelle image"
                >
                  ×
                </button>
              </div>
            </div>
            
            <span v-if="imageError" class="text-red-500 text-sm">{{ imageError }}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-2">Prix (€)</label>
              <input
                type="number"
                v-model="price"
                @input="handleChange('price', $event.target.value)"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              <span v-if="priceError" class="text-red-500 text-sm mt-1">{{ priceError }}</span>
            </div>

            <div>
              <label for="stock" class="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                v-model="stock"
                @input="handleChange('stock', $event.target.value)"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              <span v-if="stockError" class="text-red-500 text-sm mt-1">{{ stockError }}</span>
            </div>
          </div>

          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <input
              type="text"
              v-model="category"
              @input="handleChange('category', $event.target.value)"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Mugs, Tasses, Gobelets..."
            />
            <span v-if="categoryError" class="text-red-500 text-sm mt-1">{{ categoryError }}</span>
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="onSale"
              id="onSale"
              @input="handleChange('onSale', $event.target.checked)"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label for="onSale" class="ml-2 text-sm font-medium text-gray-700">
              Produit en vente
            </label>
          </div>

          <!-- Boutons d'action -->
          <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </span>
              <span v-else>Enregistrer les modifications</span>
            </button>
            
            <button
              type="button"
              @click="$router.push('/products')"
              class="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Annuler
            </button>
          </div>

          <div v-if="serverError" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              <p class="text-red-700">{{ serverError }}</p>
            </div>
          </div>
        </form>
        
        <div v-else class="text-center py-8">
          <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { z } from 'zod';
import { fetchProductById, updateProduct } from '../services/productService';
import { useForm } from '../composables/useForm';

const productSchema = z.object({
  name: z.string().min(1, 'Nom est requis'),
  description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit être un nombre positif'),
  stock: z.number().min(0, 'Le stock doit être un nombre positif'),
  category: z.string().min(1, 'Catégorie est requise'),
  onSale: z.boolean().optional(),
});

export default defineComponent({
  name: 'EditProduct',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const product = ref(null);
    
    // Gestion des images
    const imageInput = ref<HTMLInputElement>();
    const imagePreview = ref<string>('');
    const selectedImage = ref<File | null>(null);
    const imageError = ref<string>('');
    const currentImageUrl = ref<string>('');
    const removeCurrentImageFlag = ref<boolean>(false);

    const {
      values,
      name,
      description,
      price,
      stock,
      category,
      onSale,
      nameError,
      descriptionError,
      priceError,
      stockError,
      categoryError,
      onSaleError,
      isSubmitting,
      serverError,
      handleChange,
      handleSubmit,
    } = useForm({
      initialValues: {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        onSale: false,
      },
      schema: productSchema,
      onSubmit: async (updatedProduct) => {
        try {
          // Si on a une nouvelle image ou qu'on supprime l'ancienne, utiliser FormData
          if (selectedImage.value || removeCurrentImageFlag.value) {
            const formData = new FormData();
            
            // Ajouter tous les champs du produit
            Object.keys(updatedProduct).forEach(key => {
              if (updatedProduct[key] !== undefined && updatedProduct[key] !== null) {
                formData.append(key, updatedProduct[key].toString());
              }
            });
            
            // Convertir le prix en centimes
            formData.set('price', (Math.round(updatedProduct.price * 100)).toString());
            
            // Ajouter la nouvelle image si elle existe
            if (selectedImage.value) {
              formData.append('image', selectedImage.value);
            }
            
            // Indiquer si on supprime l'image actuelle
            if (removeCurrentImageFlag.value) {
              formData.append('removeImage', 'true');
            }
            
            await updateProduct(Number(route.params.id), formData);
          } else {
            // Pas de changement d'image, mise à jour classique
            const productToUpdate = {
              ...updatedProduct,
              price: Math.round(updatedProduct.price * 100)
            };
            await updateProduct(Number(route.params.id), productToUpdate);
          }
          
          router.push('/products');
        } catch (error) {
          console.error('Erreur lors de la mise à jour du produit:', error);
          throw error;
        }
      },
    });

    const handleImageChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        removeNewImage();
        return;
      }
      
      // Vérifications de validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!allowedTypes.includes(file.type)) {
        imageError.value = 'Type de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.';
        removeNewImage();
        return;
      }
      
      if (file.size > maxSize) {
        imageError.value = 'Fichier trop volumineux. Taille maximale: 5MB.';
        removeNewImage();
        return;
      }
      
      // Tout est OK
      imageError.value = '';
      selectedImage.value = file;
      
      // Créer la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    };

    const removeNewImage = () => {
      selectedImage.value = null;
      imagePreview.value = '';
      imageError.value = '';
      if (imageInput.value) {
        imageInput.value.value = '';
      }
    };

    const removeCurrentImage = () => {
      removeCurrentImageFlag.value = true;
      currentImageUrl.value = '';
    };

    const getImageUrl = (imageUrl: string) => {
      if (!imageUrl) return '';
      if (imageUrl.startsWith('http')) return imageUrl;
      
      // Construire l'URL de base sans /api pour les images
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      const fullUrl = `${baseUrl}${imageUrl}`;
      console.log('Image URL construite (EditProduct):', fullUrl);
      return fullUrl;
    };

    const fetchProduct = async () => {
      try {
        const response = await fetchProductById(Number(route.params.id));
        product.value = response;
        currentImageUrl.value = response.imageUrl || '';
        
        handleChange('name', response.name);
        handleChange('description', response.description);
        handleChange('price', response.price / 100); // Afficher en euros pour l'utilisateur
        handleChange('stock', response.stock);
        handleChange('category', response.category);
        handleChange('onSale', response.onSale);
      } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
      }
    };

    onMounted(fetchProduct);

    return {
      product,
      name,
      description,
      price,
      stock,
      category,
      onSale,
      nameError,
      descriptionError,
      priceError,
      stockError,
      categoryError,
      onSaleError,
      isSubmitting,
      serverError,
      imageInput,
      imagePreview,
      selectedImage,
      imageError,
      currentImageUrl,
      handleChange,
      handleSubmit,
      handleImageChange,
      removeNewImage,
      removeCurrentImage,
      getImageUrl,
    };
  },
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
