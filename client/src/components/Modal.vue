<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal">
        <header class="modal-header">
          <slot name="header"></slot>
        </header>
        <section class="modal-body">
          <slot name="body"></slot>
        </section>
        <footer class="modal-footer">
          <slot name="footer"></slot>
        </footer>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'Modal',
    emits: ['close'],
    setup(_, { emit }) {
      const close = () => {
        emit('close');
      };
  
      return { close };
    },
  });
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
  }
  
  .modal-header,
  .modal-footer {
    margin-bottom: 10px;
  }
  
  .modal-body {
    margin-bottom: 20px;
  }
  </style>
  