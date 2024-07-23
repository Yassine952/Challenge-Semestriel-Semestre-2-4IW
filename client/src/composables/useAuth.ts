import { ref } from 'vue';

const isAuthenticated = ref<boolean>(false);

const checkAuth = () => {
  const token = localStorage.getItem('token');
  isAuthenticated.value = !!token;
};

export const useAuth = () => {
  checkAuth();
  return {
    isAuthenticated,
  };
};
