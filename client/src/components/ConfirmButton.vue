<template>
  <div>
    <!-- Bouton moderne avec slot pour personnalisation -->
    <button 
      @click="openModal" 
      :class="buttonClass"
      class="group relative inline-flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      <slot>
        <span class="text-sm font-medium">{{ buttonText || 'Supprimer' }}</span>
      </slot>
    </button>

    <!-- Modal moderne avec design Aurora - Utilisation de Teleport pour éviter les problèmes de positionnement -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" style="position: fixed !important;">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
          <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-md p-8 z-[10000]">
            <!-- Icône d'alerte -->
            <div class="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-2xl">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <!-- Contenu -->
            <div class="text-center">
              <h3 class="text-xl font-bold text-gray-900 mb-3">
                Confirmer la suppression
              </h3>
              <p class="text-gray-600 mb-8">
                Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
              </p>

              <!-- Boutons d'action -->
              <div class="flex flex-col sm:flex-row gap-3">
                <button 
                  @click="closeModal" 
                  :disabled="isLoading"
                  class="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button 
                  @click="confirmDeletion" 
                  :disabled="isLoading"
                  class="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span v-if="!isLoading">Supprimer</span>
                  <div v-else class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Suppression...
                  </div>
                </button>
              </div>

              <!-- Message d'erreur -->
              <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p class="text-sm text-red-800">{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'ConfirmButton',
  props: {
    deleteUrl: {
      type: String,
      required: true,
    },
    onSuccess: {
      type: Function,
      required: true,
    },
    buttonText: {
      type: String,
      default: 'Supprimer',
    },
    buttonClass: {
      type: String,
      default: 'px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all duration-200',
    },
  },
  setup(props) {
    const showModal = ref(false);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const openModal = () => {
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      errorMessage.value = '';
    };

    const confirmDeletion = async () => {
      isLoading.value = true;
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;
        await axios.delete(`${apiUrl}${props.deleteUrl}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        props.onSuccess();
        closeModal();
      } catch (error) {
        errorMessage.value = 'Erreur pendant la suppression.';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      showModal,
      isLoading,
      errorMessage,
      openModal,
      closeModal,
      confirmDeletion,
    };
  },
});
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease-in-out;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.modal-enter-to, .modal-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
