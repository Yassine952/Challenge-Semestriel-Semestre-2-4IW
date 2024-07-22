<template>
    <div>
      <button @click="openModal">Delete</button>
      <modal v-if="showModal" @close="closeModal">
        <template v-slot:header>
          <h3>Confirm Deletion</h3>
        </template>
        <template v-slot:body>
          <p>Are you sure you want to delete this item?</p>
        </template>
        <template v-slot:footer>
          <button @click="confirmDeletion" :disabled="isLoading">Yes</button>
          <button @click="closeModal" :disabled="isLoading">No</button>
        </template>
        <div v-if="isLoading">Loading...</div>
        <div v-if="errorMessage">{{ errorMessage }}</div>
      </modal>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import Modal from './Modal.vue';
  import axios from 'axios';
  
  export default defineComponent({
    name: 'ConfirmButton',
    components: { Modal },
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
          await axios.delete(props.deleteUrl, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          props.onSuccess();
          closeModal();
        } catch (error) {
          errorMessage.value = 'Failed to delete the item.';
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
  /* Add your styles here */
  </style>
  