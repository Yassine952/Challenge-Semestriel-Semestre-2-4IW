<template>
  <div>
    <button @click="openModal" class="w-32 mx-auto py-2 ml-2 shadow-sm rounded-md bg-indigo-600 text-white mt-4 flex items-center justify-center">
      Supprimer
    </button>
    <transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black opacity-40"></div>
        <div class="bg-white rounded-md shadow-lg px-4 py-6 w-full max-w-lg z-50">
          <div class="flex items-center justify-center flex-none w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="mt-2 text-center sm:ml-4 sm:text-left">
            <h3 class="text-lg font-medium text-gray-800 mt-2 text-center sm:ml-4">
              Confirmation de suppression
            </h3>
            <p class="mt-2 text-sm text-center leading-relaxed text-gray-500">
              Voulez-vous vraiment supprimer ?
            </p>
            <div class="items-center gap-2 mt-3 text-sm sm:flex">
              <button @click="confirmDeletion" :disabled="isLoading" class="w-full mt-2 p-2.5 flex-1 text-white bg-red-600 rounded-md outline-none ring-offset-2 ring-red-600 focus:ring-2">
                Oui
              </button>
              <button @click="closeModal" :disabled="isLoading" class="w-full mt-2 p-2.5 flex-1 text-gray-800 rounded-md border ring-offset-2 ring-indigo-600 focus:ring-2">
                Non
              </button>
            </div>
            <div v-if="isLoading" class="mt-3 text-center">Chargement...</div>
            <div v-if="errorMessage" class="mt-3 text-center text-red-500">{{ errorMessage }}</div>
          </div>
        </div>
      </div>
    </transition>
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
  transition: opacity 0.3s;
}
.modal-enter, .modal-leave-to {
  opacity: 0;
}
</style>
