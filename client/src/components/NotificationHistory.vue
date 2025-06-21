<template>
  <div>
    <!-- Wrapper moderne pour le composant existant -->
    <UserAlertHistory />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserAlertHistory from './UserAlertHistory.vue';

export default defineComponent({
  name: 'NotificationHistory',
  components: {
    UserAlertHistory
  }
});
</script> 