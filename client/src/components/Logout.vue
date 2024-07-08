<template>
  <button @click="logout">Logout</button>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.removeItem('token');
      this.$emit('loggedOut');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
}
</style>
