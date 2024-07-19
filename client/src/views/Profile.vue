<template>
  <div class="profile">
    <h1>Profile</h1>
    <form @submit.prevent="updateProfile">
      <div>
        <label for="firstName">First Name:</label>
        <input type="text" v-model="user.firstName" required />
      </div>
      <div>
        <label for="lastName">Last Name:</label>
        <input type="text" v-model="user.lastName" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="user.email" readonly />
      </div>
      <div>
        <label for="shippingAddress">Shipping Address:</label>
        <input type="text" v-model="user.shippingAddress" required />
      </div>
      <button type="submit">Update Profile</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'Profile',
  setup() {
    const user = reactive({
      firstName: '',
      lastName: '',
      email: '',
      shippingAddress: ''
    });
    const error = ref('');

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        Object.assign(user, response.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        error.value = 'Failed to fetch profile';
      }
    };

    const updateProfile = async () => {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/profile`, user, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('Profile updated successfully');
      } catch (error) {
        console.error('Failed to update profile', error);
        error.value = 'Failed to update profile';
      }
    };

    onMounted(fetchProfile);

    return { user, error, updateProfile };
  }
});
</script>

<style scoped>
.error {
  color: red;
}
form {
  display: flex;
  flex-direction: column;
}
form div {
  margin-bottom: 10px;
}
label {
  margin-right: 10px;
}
button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
</style>
