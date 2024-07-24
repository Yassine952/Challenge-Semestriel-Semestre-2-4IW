<template>
  <button @click="logout">Logout</button>
</template>

<script>
export default {
  methods: {
    logout() {
      console.log('Before removing:', localStorage.getItem('role'));
      localStorage.removeItem('role');
      console.log('After removing:', localStorage.getItem('role'));
      this.$emit('loggedOut');
      this.$router.push('/login');
    }
  }
};
</script>
