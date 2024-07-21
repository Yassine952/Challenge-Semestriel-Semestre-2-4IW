import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import ResetPassword from '../views/ResetPassword.vue';
import ProductList from '../views/ProductList.vue';
import AddProduct from '../views/AddProduct.vue';
import EditProduct from '../views/EditProduct.vue';
import UserList from '../views/UserList.vue';
import AdminPanel from '../views/AdminPanel.vue';
import ProductSearch from '../views/ProductSearch.vue'; // Importez le composant de recherche
import Cart from '../views/Cart.vue';
import Profile from '../views/Profile.vue'; // Importer le composant Profile

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/reset-password/:token', name: 'ResetPassword', component: ResetPassword },
  { path: '/products', name: 'ProductList', component: ProductList },
  { path: '/add-product', name: 'AddProduct', component: AddProduct },
  { path: '/edit-product/:id', name: 'EditProduct', component: EditProduct },
  { path: '/users', name: 'UserList', component: UserList },
  { path: '/admin', name: 'AdminPanel', component: AdminPanel },
  { path: '/search', name: 'ProductSearch', component: ProductSearch }, // Ajoutez la route de recherche
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/profile', name: 'Profile', component: Profile } // Ajouter la route Profile
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
